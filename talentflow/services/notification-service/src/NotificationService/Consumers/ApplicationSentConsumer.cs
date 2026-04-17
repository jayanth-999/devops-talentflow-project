using Confluent.Kafka;
using NotificationService.Models;
using NotificationService.Services;
using System.Text.Json;

namespace NotificationService.Consumers;

/// <summary>
/// Consumes application.sent events and notifies employers of new applications.
/// </summary>
public class ApplicationSentConsumer : BackgroundService
{
    private readonly IConfiguration _config;
    private readonly IServiceProvider _services;
    private readonly ILogger<ApplicationSentConsumer> _logger;
    private const string Topic = "application.sent";

    public ApplicationSentConsumer(IConfiguration config, IServiceProvider services,
        ILogger<ApplicationSentConsumer> logger)
    {
        _config = config; _services = services; _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var consumerConfig = new ConsumerConfig
        {
            BootstrapServers = _config["Kafka:BootstrapServers"] ?? "localhost:9092",
            GroupId = "notification-service-applications",
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = false,
        };

        using var consumer = new ConsumerBuilder<string, string>(consumerConfig).Build();
        consumer.Subscribe(Topic);
        _logger.LogInformation("Started consuming topic: {Topic}", Topic);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var result = consumer.Consume(stoppingToken);
                var payload = JsonSerializer.Deserialize<JsonElement>(result.Message.Value);

                var jobTitle       = payload.GetProperty("jobTitle").GetString() ?? "";
                var company        = payload.GetProperty("company").GetString() ?? "";
                var applicantId    = payload.GetProperty("applicantUserId").GetString() ?? "";
                var employerUserId = payload.GetProperty("employerUserId").GetString() ?? "";

                // Note: In production, fetch email by userId from user-service
                // Here we log the event as proof of consumption
                _logger.LogInformation(
                    "New application for job '{JobTitle}' at {Company}. Applicant: {ApplicantId}",
                    jobTitle, company, applicantId);

                var repoService = _services.GetRequiredService<INotificationRepository>();
                await repoService.CreateAsync(new NotificationLog
                {
                    EventType       = "APPLICATION_SENT",
                    RecipientUserId = employerUserId,
                    Subject         = $"New application for: {jobTitle}",
                    Body            = $"You have a new application for '{jobTitle}' at {company}.",
                    Status          = NotificationLog.NotificationStatus.Sent,
                    SentAt          = DateTime.UtcNow,
                });

                consumer.Commit(result);
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing {Topic} event", Topic);
                await Task.Delay(1000, stoppingToken);
            }
        }
        consumer.Close();
    }
}
