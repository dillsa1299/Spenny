// Production-oriented SMTP sender when Email:SmtpHost is configured.
using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

using Spenny.Api.Auth.Identity;

namespace Spenny.Api.Auth.Email;

public sealed class SmtpTransactionalEmailSender(
    IOptions<EmailSettings> emailOptions,
    ILogger<SmtpTransactionalEmailSender> logger) : ITransactionalEmailSender
{
    private readonly EmailSettings _email = emailOptions.Value;

    public async Task SendEmailConfirmationAsync(SpennyUser user, string confirmationLink, CancellationToken cancellationToken)
    {
        var body = $"""
            Hi {user.DisplayName},

            Confirm your Spenny account by opening this link:

            {confirmationLink}

            If you did not create an account, you can ignore this message.
            """;

        await SendAsync(user.Email!, "Confirm your Spenny email", body, cancellationToken);
    }

    public async Task SendPasswordResetAsync(SpennyUser user, string resetLink, CancellationToken cancellationToken)
    {
        var body = $"""
            Hi {user.DisplayName},

            Reset your Spenny password using this link:

            {resetLink}

            If you did not request a reset, you can ignore this message.
            """;

        await SendAsync(user.Email!, "Reset your Spenny password", body, cancellationToken);
    }

    private async Task SendAsync(string to, string subject, string body, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_email.SmtpHost))
        {
            throw new InvalidOperationException("SMTP host is not configured.");
        }

        using var message = new MailMessage
        {
            From = new MailAddress(_email.FromAddress, _email.FromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = false,
        };
        message.To.Add(to);

        using var client = new SmtpClient(_email.SmtpHost, _email.SmtpPort)
        {
            EnableSsl = _email.SmtpPort != 25,
        };

        if (!string.IsNullOrWhiteSpace(_email.SmtpUser))
        {
            client.Credentials = new NetworkCredential(_email.SmtpUser, _email.SmtpPassword);
        }

        try
        {
            await client.SendMailAsync(message, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to {Recipient}", to);
            throw;
        }
    }
}
