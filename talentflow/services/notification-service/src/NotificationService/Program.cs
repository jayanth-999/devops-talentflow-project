using NotificationService.Models;
using NotificationService.Services;
using NotificationService.Consumers;
using MongoDB.Driver;
using Prometheus;
using Serilog;
using OpenTelemetry.Trace;
using OpenTelemetry.Resources;
using OpenTelemetry.Exporter;
using Microsoft.Extensions.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

// ── Serilog ─────────────────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3}] [{TraceId}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

// ── Settings ─────────────────────────────────────────────────────────────────
builder.Services.Configure<NotificationSettings>(
    builder.Configuration.GetSection("Notification"));

// ── MongoDB ──────────────────────────────────────────────────────────────────
var mongoUri = builder.Configuration["MongoDB:Uri"] ?? "mongodb://localhost:27017";
var mongoDb  = builder.Configuration["MongoDB:Database"] ?? "notifications";
builder.Services.AddSingleton<IMongoClient>(_ => new MongoClient(mongoUri));
builder.Services.AddSingleton(sp =>
    sp.GetRequiredService<IMongoClient>().GetDatabase(mongoDb));

// ── Application Services ──────────────────────────────────────────────────────
builder.Services.AddSingleton<INotificationRepository, NotificationRepository>();
builder.Services.AddSingleton<IEmailService, EmailService>();

// ── Kafka Consumers (Hosted Services) ────────────────────────────────────────
builder.Services.AddHostedService<UserRegisteredConsumer>();
builder.Services.AddHostedService<ApplicationSentConsumer>();
builder.Services.AddHostedService<JobPostedConsumer>();

// ── Health Checks ─────────────────────────────────────────────────────────────
// Manual MongoDB ping to avoid package version conflicts with MongoDB.Driver 2.29
builder.Services.AddHealthChecks()
    .Add(new HealthCheckRegistration(
        "mongodb",
        sp =>
        {
            var client = sp.GetRequiredService<IMongoClient>();
            return new MongoHealthCheck(client);
        },
        failureStatus: null,
        tags: ["db", "mongodb"]));

// ── OpenTelemetry ─────────────────────────────────────────────────────────────
var jaegerHost = builder.Configuration["Jaeger:AgentHost"] ?? "localhost";
var jaegerPort = int.Parse(builder.Configuration["Jaeger:AgentPort"] ?? "6831");

var otlpEndpoint = builder.Configuration["Jaeger:OtlpEndpoint"] ?? $"http://{jaegerHost}:4317";

builder.Services.AddOpenTelemetry()
    .WithTracing(trace => trace
        .SetResourceBuilder(ResourceBuilder.CreateDefault()
            .AddService("notification-service"))
        .AddAspNetCoreInstrumentation()
        .AddOtlpExporter(otlp =>
        {
            otlp.Endpoint = new Uri(otlpEndpoint);
        }));

// ── Controllers & Swagger ────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "TalentFlow Notification Service", Version = "v1" });
});

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// ── Middleware Pipeline ───────────────────────────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI();

app.UseSerilogRequestLogging();
app.UseCors();
app.UseRouting();

// Redirect root to swagger
app.MapGet("/", () => Results.Redirect("/swagger"));

app.UseSerilogRequestLogging();
app.UseCors();
app.UseRouting();

// Prometheus metrics endpoint
app.UseHttpMetrics();
app.MapMetrics("/metrics");

// Health check
app.MapHealthChecks("/health");

app.MapControllers();

app.Run();
