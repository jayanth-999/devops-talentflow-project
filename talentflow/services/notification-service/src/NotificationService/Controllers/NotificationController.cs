using Microsoft.AspNetCore.Mvc;
using NotificationService.Models;
using NotificationService.Services;

namespace NotificationService.Controllers;

[ApiController]
[Route("api/v1/notifications")]
public class NotificationController : ControllerBase
{
    private readonly INotificationRepository _repository;

    public NotificationController(INotificationRepository repository)
    {
        _repository = repository;
    }

    /// <summary>
    /// Gets the most recent notification logs.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificationLog>>> GetRecent([FromQuery] int limit = 50)
    {
        var logs = await _repository.GetRecentAsync(limit);
        return Ok(logs);
    }
}
