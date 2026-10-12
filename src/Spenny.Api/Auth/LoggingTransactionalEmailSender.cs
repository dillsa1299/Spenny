// Development and test email sender: writes links to logs instead of SMTP (no secrets required).
namespace Spenny.Api.Auth;

public sealed class LoggingTransactionalEmailSender(ILogger<LoggingTransactionalEmailSender> logger)
    : ITransactionalEmailSender
{
    public Task SendEmailConfirmationAsync(SpennyUser user, string confirmationLink, CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "Email confirmation for {Email}: {Link}",
            user.Email,
            confirmationLink);
        return Task.CompletedTask;
    }

    public Task SendPasswordResetAsync(SpennyUser user, string resetLink, CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "Password reset for {Email}: {Link}",
            user.Email,
            resetLink);
        return Task.CompletedTask;
    }
}
