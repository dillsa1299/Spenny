// Google OAuth client credentials bound from user secrets or environment (never committed).
namespace Spenny.Api.Auth.Google;

public sealed class GoogleAuthSettings
{
    public const string SectionName = "Authentication:Google";

    public string? ClientId { get; set; }

    public string? ClientSecret { get; set; }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(ClientId) && !string.IsNullOrWhiteSpace(ClientSecret);
}

internal sealed class GoogleAuthServicesRegistered;
