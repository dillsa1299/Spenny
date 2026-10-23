// Production-oriented SMTP sender when Email:SmtpHost is configured.
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;
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
        var (plain, html) = TransactionalEmailTemplates.EmailConfirmation(user.DisplayName, confirmationLink);
        await SendAsync(user.Email!, "Confirm your Spenny email", plain, html, cancellationToken);
    }

    public async Task SendPasswordResetAsync(SpennyUser user, string resetLink, CancellationToken cancellationToken)
    {
        var (plain, html) = TransactionalEmailTemplates.PasswordReset(user.DisplayName, resetLink);
        await SendAsync(user.Email!, "Reset your Spenny password", plain, html, cancellationToken);
    }

    private async Task SendAsync(
        string to,
        string subject,
        string plainBody,
        string htmlBody,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_email.SmtpHost))
        {
            throw new InvalidOperationException("SMTP host is not configured.");
        }

        cancellationToken.ThrowIfCancellationRequested();

        using var message = new MailMessage
        {
            From = new MailAddress(_email.FromAddress, _email.FromName),
            Subject = subject,
            Body = plainBody,
            IsBodyHtml = false,
        };
        message.To.Add(to);
        message.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(
            htmlBody,
            Encoding.UTF8,
            MediaTypeNames.Text.Html));

        using var client = new SmtpClient(_email.SmtpHost, _email.SmtpPort)
        {
            EnableSsl = _email.GetEffectiveUseSsl(),
            Timeout = _email.SmtpTimeoutSeconds * 1000,
        };

        if (!string.IsNullOrWhiteSpace(_email.SmtpUser))
        {
            client.Credentials = new NetworkCredential(_email.SmtpUser, _email.SmtpPassword);
        }

        try
        {
            // System.Net.Mail does not honour CancellationToken during the send.
            await client.SendMailAsync(message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to {Recipient}", to);
            throw;
        }
    }
}
