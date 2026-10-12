// Sends account verification and password-reset messages; implementations use SMTP or dev logging.
namespace Spenny.Api.Auth;

public interface ITransactionalEmailSender
{
    Task SendEmailConfirmationAsync(SpennyUser user, string confirmationLink, CancellationToken cancellationToken);

    Task SendPasswordResetAsync(SpennyUser user, string resetLink, CancellationToken cancellationToken);
}
