using Confluent.Kafka;
using NotificationService.Models;
using NotificationService.Services;
using System.Text.Json;

namespace NotificationService.Consumers;

/// <summary>
/// Consumes user.registered events from Kafka and sends welcome emails.
/// </summary>
public class UserRegisteredConsumer : BackgroundService
{
    private readonly IConfiguration _config;
    private readonly IServiceProvider _services;
    private readonly ILogger<UserRegisteredConsumer> _logger;
    private const string Topic = "user.registered";

    public UserRegisteredConsumer(
        IConfiguration config,
        IServiceProvider services,
        ILogger<UserRegisteredConsumer> logger)
    {
        _config = config;
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var consumerConfig = new ConsumerConfig
        {
            BootstrapServers = _config["Kafka:BootstrapServers"] ?? "localhost:9092",
            GroupId = "notification-service-user",
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
                _logger.LogInformation("Received event from {Topic}: {Key}", Topic, result.Message.Key);

                var payload = JsonSerializer.Deserialize<JsonElement>(result.Message.Value);

                var email    = payload.GetProperty("email").GetString() ?? "";
                var username = payload.GetProperty("username").GetString() ?? "";
                var userId   = result.Message.Key;

                // Send welcome email
                var emailService = _services.GetRequiredService<IEmailService>();
                var repoService  = _services.GetRequiredService<INotificationRepository>();

                var log = await repoService.CreateAsync(new NotificationLog
                {
                    EventType       = "USER_REGISTERED",
                    RecipientEmail  = email,
                    RecipientUserId = userId,
                    Subject         = $"Welcome to TalentFlow, {username}! 🎉",
                    Body            = $"Hi {username},\n\nWelcome to TalentFlow! Your account has been created successfully.\n\nStart exploring jobs today!\n\nThe TalentFlow Team",
                });

                await emailService.SendAsync(email, log.Subject, log.Body);
                await repoService.UpdateStatusAsync(log.Id!, NotificationLog.NotificationStatus.Sent);

                consumer.Commit(result);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing {Topic} event", Topic);
                await Task.Delay(1000, stoppingToken);
            }
        }

        consumer.Close();
    }
}
