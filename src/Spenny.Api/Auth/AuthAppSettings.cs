// SPA-facing auth URLs and cookie/session options bound from configuration.
using System.ComponentModel.DataAnnotations;

namespace Spenny.Api.Auth;

public sealed class AuthAppSettings
{
    public const string SectionName = "Auth";

    [Required]
    [Url]
    public string SpaBaseUrl { get; set; } = "http://localhost:5173";
}
