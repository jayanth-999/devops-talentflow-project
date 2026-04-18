using Microsoft.Extensions.Diagnostics.HealthChecks;
using MongoDB.Driver;

namespace NotificationService.Services;

/// <summary>
/// Simple MongoDB health check that pings the server.
/// Used instead of AspNetCore.HealthChecks.MongoDb to avoid
/// conflicting MongoDB.Driver transitive dependency (that package
/// bundles Driver 2.22, which conflicts with Driver 2.29 used here).
/// </summary>
public class MongoHealthCheck : IHealthCheck
{
    private readonly IMongoClient _client;

    public MongoHealthCheck(IMongoClient client)
    {
        _client = client;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _client.GetDatabase("admin")
                .RunCommandAsync<MongoDB.Bson.BsonDocument>(
                    new MongoDB.Driver.JsonCommand<MongoDB.Bson.BsonDocument>("{ping:1}"),
                    cancellationToken: cancellationToken);

            return HealthCheckResult.Healthy("MongoDB is reachable.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("MongoDB ping failed.", ex);
        }
    }
}
