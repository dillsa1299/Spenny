// Records successful sign-ins for aggregate admin metrics (user id + time only).
namespace Spenny.Api.Auth;

public sealed class LoginAuditEvent
{
    public long Id { get; set; }

    public required string UserId { get; set; }

    public DateTimeOffset OccurredAtUtc { get; set; }
}
