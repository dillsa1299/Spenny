// SMTP and sender configuration for verification and password-reset mail (secrets via env/user secrets).
using System.ComponentModel.DataAnnotations;

namespace Spenny.Api.Auth.Email;

public sealed class EmailSettings
{
    public const string SectionName = "Email";

    [Required]
    public string FromAddress { get; set; } = "noreply@localhost";

    public string FromName { get; set; } = "Spenny";

    /// <summary>When empty, dev uses a logging sender instead of SMTP.</summary>
    public string? SmtpHost { get; set; }

    public int SmtpPort { get; set; } = 587;

    public string? SmtpUser { get; set; }

    public string? SmtpPassword { get; set; }
}
