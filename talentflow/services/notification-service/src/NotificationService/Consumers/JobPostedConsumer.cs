using Confluent.Kafka;
using NotificationService.Models;
using NotificationService.Services;
using System.Text.Json;

namespace NotificationService.Consumers;

/// <summary>
/// Consumes job.posted events — could notify subscribed job seekers.
/// </summary>
public class JobPostedConsumer : BackgroundService
{
    private readonly IConfiguration _config;
    private readonly IServiceProvider _services;
    private readonly ILogger<JobPostedConsumer> _logger;
    private const string Topic = "job.posted";

    public JobPostedConsumer(IConfiguration config, IServiceProvider services,
        ILogger<JobPostedConsumer> logger)
    {
        _config = config; _services = services; _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var consumerConfig = new ConsumerConfig
        {
            BootstrapServers = _config["Kafka:BootstrapServers"] ?? "localhost:9092",
            GroupId = "notification-service-jobs",
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

                var title   = payload.GetProperty("title").GetString()   ?? "";
                var company = payload.GetProperty("company").GetString() ?? "";
                var jobId   = result.Message.Key;

                _logger.LogInformation("New job posted: '{Title}' at {Company} (id={JobId})", title, company, jobId);

                var repoService = _services.GetRequiredService<INotificationRepository>();
                await repoService.CreateAsync(new NotificationLog
                {
                    EventType       = "JOB_POSTED",
                    RecipientUserId = "broadcast",
                    Subject         = $"New Job: {title} at {company}",
                    Body            = $"A new job has been posted: '{title}' at {company}.",
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
