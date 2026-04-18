using Microsoft.AspNetCore.Mvc;
using Moq;
using NotificationService.Controllers;
using NotificationService.Models;
using NotificationService.Services;
using Xunit;

namespace NotificationService.Tests;

public class NotificationControllerTests
{
    [Fact]
    public async Task GetRecent_ShouldReturnOk_WithNotificationLogs()
    {
        // Arrange
        var mockRepo = new Mock<INotificationRepository>();
        var logs = new List<NotificationLog>
        {
            new NotificationLog { EventType = "TEST_EVENT", Subject = "Test Subject 1" },
            new NotificationLog { EventType = "TEST_EVENT", Subject = "Test Subject 2" }
        };
        
        mockRepo.Setup(r => r.GetRecentAsync(It.IsAny<int>()))
                .ReturnsAsync(logs);

        var controller = new NotificationController(mockRepo.Object);

        // Act
        var result = await controller.GetRecent(50);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedLogs = Assert.IsAssignableFrom<IEnumerable<NotificationLog>>(okResult.Value);
        Assert.Equal(2, returnedLogs.Count());
    }
}
