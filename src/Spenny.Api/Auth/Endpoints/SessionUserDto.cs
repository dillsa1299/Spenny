// Session user payload returned by login, session, and profile update routes.
using Spenny.Api.Auth.Identity;

namespace Spenny.Api.Auth.Endpoints;

public sealed record SessionUserDto(
    string Id,
    string Email,
    string DisplayName,
    bool EmailConfirmed,
    string AuthProvider,
    bool IsAdmin)
{
    public static SessionUserDto FromUser(SpennyUser user) => new(
        user.Id,
        user.Email ?? string.Empty,
        user.DisplayName,
        user.EmailConfirmed,
        user.AuthProvider.ToString(),
        user.IsAdmin);
}
