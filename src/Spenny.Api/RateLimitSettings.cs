// Bound configuration for the per-IP rate limit applied to every /api route.
using System.ComponentModel.DataAnnotations;

namespace Spenny.Api;

/// <summary>
/// Fixed-window limit applied per remote IP address. Validated on startup so a bad value
/// fails the host instead of silently disabling the limit.
/// </summary>
public sealed class RateLimitSettings
{
    public const string SectionName = "RateLimit";

    /// <summary>Maximum requests allowed per IP in one window.</summary>
    [Range(1, 10_000)]
    public int PermitLimit { get; init; } = 60;

    /// <summary>Length of the window in seconds.</summary>
    [Range(1, 3_600)]
    public int WindowSeconds { get; init; } = 60;
}
