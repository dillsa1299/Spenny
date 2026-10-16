// Distinguishes how the user authenticates (local password vs external OAuth).
namespace Spenny.Api.Auth.Identity;

public enum AuthProviderKind
{
    Local = 0,
    Google = 1,
}
