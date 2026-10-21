// Application user for ASP.NET Identity: profile fields and provider metadata beyond the stock IdentityUser.
using Microsoft.AspNetCore.Identity;

namespace Spenny.Api.Auth.Identity;

public sealed class SpennyUser : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;

    public AuthProviderKind AuthProvider { get; set; } = AuthProviderKind.Local;

    public bool IsAdmin { get; set; }

    public DateTimeOffset RegisteredAtUtc { get; set; }
}
