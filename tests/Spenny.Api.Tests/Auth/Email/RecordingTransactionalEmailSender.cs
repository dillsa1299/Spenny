// Test double that records transactional email payloads for assertions.
using Spenny.Api.Auth.Email;
using Spenny.Api.Auth.Identity;

namespace Spenny.Api.Tests.Auth.Email;

internal sealed class RecordingTransactionalEmailSender : ITransactionalEmailSender
{
    private readonly Func<CancellationToken, Task>? _onSend;

    public RecordingTransactionalEmailSender(Func<CancellationToken, Task>? onSend = null)
    {
        _onSend = onSend;
    }

    public List<(string Kind, string Email, string Link)> Sent { get; } = [];

    public Task SendEmailConfirmationAsync(SpennyUser user, string confirmationLink, CancellationToken cancellationToken)
    {
        Sent.Add(("confirm", user.Email!, confirmationLink));
        return _onSend?.Invoke(cancellationToken) ?? Task.CompletedTask;
    }

    public Task SendPasswordResetAsync(SpennyUser user, string resetLink, CancellationToken cancellationToken)
    {
        Sent.Add(("reset", user.Email!, resetLink));
        return _onSend?.Invoke(cancellationToken) ?? Task.CompletedTask;
    }
}
