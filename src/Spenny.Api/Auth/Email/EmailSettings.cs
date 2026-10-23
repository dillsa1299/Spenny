// SMTP and sender configuration for verification and password-reset mail (secrets via env/user secrets).
using System.ComponentModel.DataAnnotations;
using System.Net.Mail;

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

    /// <summary>When null, SSL follows common port defaults (on for 465/587, off for 25/1025).</summary>
    public bool? UseSsl { get; set; }

    public int SmtpTimeoutSeconds { get; set; } = 30;

    public bool IsSmtpConfigured => !string.IsNullOrWhiteSpace(SmtpHost);

    public bool GetEffectiveUseSsl()
    {
        if (UseSsl.HasValue)
        {
            return UseSsl.Value;
        }

        return SmtpPort is 465 or 587;
    }

    public IEnumerable<string> ValidateForStartup(bool requireSmtpInProduction, bool isProduction)
    {
        var failures = new List<string>();

        if (requireSmtpInProduction && isProduction && !IsSmtpConfigured)
        {
            failures.Add(
                "Email:SmtpHost is required in Production when authentication is enabled (local accounts need transactional email).");
        }

        if (SmtpTimeoutSeconds is < 1 or > 300)
        {
            failures.Add("Email:SmtpTimeoutSeconds must be between 1 and 300.");
        }

        if (!IsSmtpConfigured)
        {
            return failures;
        }

        if (SmtpPort is < 1 or > 65535)
        {
            failures.Add("Email:SmtpPort must be between 1 and 65535.");
        }

        if (!TryParseEmail(FromAddress))
        {
            failures.Add("Email:FromAddress must be a valid email address when SMTP is configured.");
        }

        if (!string.IsNullOrWhiteSpace(SmtpUser) && string.IsNullOrWhiteSpace(SmtpPassword))
        {
            failures.Add("Email:SmtpPassword is required when Email:SmtpUser is set.");
        }

        return failures;
    }

    private static bool TryParseEmail(string? address)
    {
        if (string.IsNullOrWhiteSpace(address))
        {
            return false;
        }

        return MailAddress.TryCreate(address, out _);
    }
}
