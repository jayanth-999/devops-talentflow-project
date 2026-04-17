using MongoDB.Driver;
using NotificationService.Models;

namespace NotificationService.Services;

public interface INotificationRepository
{
    Task<NotificationLog> CreateAsync(NotificationLog log);
    Task UpdateStatusAsync(string id, NotificationLog.NotificationStatus status, string? error = null);
    Task<IEnumerable<NotificationLog>> GetRecentAsync(int limit = 50);
}

public class NotificationRepository : INotificationRepository
{
    private readonly IMongoCollection<NotificationLog> _collection;

    public NotificationRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<NotificationLog>("notification_logs");

        // Create indexes
        var indexKeys = Builders<NotificationLog>.IndexKeys
            .Descending(n => n.CreatedAt);
        _collection.Indexes.CreateOne(new CreateIndexModel<NotificationLog>(indexKeys));
    }

    public async Task<NotificationLog> CreateAsync(NotificationLog log)
    {
        await _collection.InsertOneAsync(log);
        return log;
    }

    public async Task UpdateStatusAsync(string id, NotificationLog.NotificationStatus status, string? error = null)
    {
        var filter = Builders<NotificationLog>.Filter.Eq(n => n.Id, id);
        var update = Builders<NotificationLog>.Update
            .Set(n => n.Status, status)
            .Set(n => n.SentAt, status == NotificationLog.NotificationStatus.Sent ? DateTime.UtcNow : null)
            .Set(n => n.ErrorMessage, error);
        await _collection.UpdateOneAsync(filter, update);
    }

    public async Task<IEnumerable<NotificationLog>> GetRecentAsync(int limit = 50)
    {
        return await _collection.Find(_ => true)
            .SortByDescending(n => n.CreatedAt)
            .Limit(limit)
            .ToListAsync();
    }
}
