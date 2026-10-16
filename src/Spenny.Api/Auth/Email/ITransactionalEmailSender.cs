// Sends account verification and password-reset messages; implementations use SMTP or dev logging.
using Spenny.Api.Auth.Identity;

namespace Spenny.Api.Auth.Email;

public interface ITransactionalEmailSender
{
    Task SendEmailConfirmationAsync(SpennyUser user, string confirmationLink, CancellationToken cancellationToken);

    Task SendPasswordResetAsync(SpennyUser user, string resetLink, CancellationToken cancellationToken);
}
