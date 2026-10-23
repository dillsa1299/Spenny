// Validates Email options at startup (SMTP completeness and Production requirements).
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace Spenny.Api.Auth.Email;

public sealed class EmailSettingsValidator(IHostEnvironment environment) : IValidateOptions<EmailSettings>
{
    public ValidateOptionsResult Validate(string? name, EmailSettings options)
    {
        var failures = options.ValidateForStartup(requireSmtpInProduction: true, environment.IsProduction()).ToList();
        return failures.Count > 0
            ? ValidateOptionsResult.Fail(failures)
            : ValidateOptionsResult.Success;
    }
}
