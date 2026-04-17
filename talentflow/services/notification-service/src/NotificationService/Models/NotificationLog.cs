using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace NotificationService.Models;

public class NotificationLog
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string EventType { get; set; } = string.Empty;
    public string RecipientEmail { get; set; } = string.Empty;
    public string RecipientUserId { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public NotificationStatus Status { get; set; } = NotificationStatus.Pending;
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SentAt { get; set; }

    public enum NotificationStatus
    {
        Pending,
        Sent,
        Failed
    }
}

public class NotificationSettings
{
    public string FromEmail { get; set; } = "noreply@talentflow.com";
    public string? SendGridApiKey { get; set; }
    public bool MockEmail { get; set; } = true; // Use mock in dev
}
