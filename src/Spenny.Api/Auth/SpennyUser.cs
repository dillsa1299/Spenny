// Application user for ASP.NET Identity: profile fields and provider metadata beyond the stock IdentityUser.
using Microsoft.AspNetCore.Identity;

namespace Spenny.Api.Auth;

public sealed class SpennyUser : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;

    public AuthProviderKind AuthProvider { get; set; } = AuthProviderKind.Local;

    public bool IsAdmin { get; set; }
}
