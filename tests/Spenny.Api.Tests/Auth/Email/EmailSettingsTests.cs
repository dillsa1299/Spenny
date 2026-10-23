// Unit tests for Email SMTP configuration validation at startup.
using Spenny.Api.Auth.Email;

namespace Spenny.Api.Tests.Auth.Email;

public class EmailSettingsTests
{
    [Fact]
    public void ValidateForStartup_ProductionWithoutSmtp_Fails()
    {
        var settings = new EmailSettings { SmtpHost = null };

        var failures = settings.ValidateForStartup(requireSmtpInProduction: true, isProduction: true).ToList();

        Assert.Contains(failures, f => f.Contains("SmtpHost", StringComparison.Ordinal));
    }

    [Fact]
    public void ValidateForStartup_SmtpWithoutPasswordWhenUserSet_Fails()
    {
        var settings = new EmailSettings
        {
            SmtpHost = "smtp.example.com",
            SmtpUser = "user",
            SmtpPassword = null,
            FromAddress = "noreply@example.com",
        };

        var failures = settings.ValidateForStartup(requireSmtpInProduction: false, isProduction: false).ToList();

        Assert.Contains(failures, f => f.Contains("SmtpPassword", StringComparison.Ordinal));
    }

    [Fact]
    public void GetEffectiveUseSsl_UsesPortDefaultsWhenUnset()
    {
        Assert.False(new EmailSettings { SmtpPort = 1025 }.GetEffectiveUseSsl());
        Assert.True(new EmailSettings { SmtpPort = 587 }.GetEffectiveUseSsl());
        Assert.False(new EmailSettings { SmtpPort = 587, UseSsl = false }.GetEffectiveUseSsl());
    }
}
