// Tests for ITransactionalEmailSender DI wiring (logging vs SMTP) without a live SMTP server.
using Microsoft.Extensions.DependencyInjection;
using Spenny.Api.Auth.Email;
using Spenny.Api.Tests.Support;

namespace Spenny.Api.Tests.Auth.Email;

public class TransactionalEmailSenderRegistrationTests
{
    [Fact]
    public async Task WithoutSmtpHost_RegistersLoggingSender()
    {
        await using var factory = new AuthWebApplicationFactory();
        using var scope = factory.Services.CreateScope();
        var sender = scope.ServiceProvider.GetRequiredService<ITransactionalEmailSender>();

        Assert.IsType<LoggingTransactionalEmailSender>(sender);
    }

    [Fact]
    public async Task WithSmtpHost_RegistersSmtpSender()
    {
        await using var factory = new AuthWebApplicationFactory().WithWebHostBuilder(builder =>
            builder.UseSetting("Email:SmtpHost", "localhost")
                .UseSetting("Email:SmtpPort", "1025")
                .UseSetting("Email:UseSsl", "false")
                .UseSetting("Email:FromAddress", "noreply@localhost"));

        using var scope = factory.Services.CreateScope();
        var sender = scope.ServiceProvider.GetRequiredService<ITransactionalEmailSender>();

        Assert.IsType<SmtpTransactionalEmailSender>(sender);
    }
}
