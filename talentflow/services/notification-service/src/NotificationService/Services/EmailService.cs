using Microsoft.Extensions.Options;
using NotificationService.Models;

namespace NotificationService.Services;

public interface IEmailService
{
    Task SendAsync(string to, string subject, string body);
}

public class EmailService : IEmailService
{
    private readonly NotificationSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<NotificationSettings> settings, ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SendAsync(string to, string subject, string body)
    {
        if (_settings.MockEmail)
        {
            // In development: just log the email
            _logger.LogInformation(
                "📧 [MOCK EMAIL] To: {To} | Subject: {Subject} | Body: {Body}",
                to, subject, body);
            await Task.Delay(10); // Simulate network
            return;
        }

        // TODO: Integrate real provider (SendGrid, SMTP, etc.)
        // Example with SendGrid:
        // var client = new SendGridClient(_settings.SendGridApiKey);
        // var msg = MailHelper.CreateSingleEmail(
        //     new EmailAddress(_settings.FromEmail),
        //     new EmailAddress(to), subject, body, body);
        // await client.SendEmailAsync(msg);

        _logger.LogInformation("Email sent to {To} with subject: {Subject}", to, subject);
    }
}
