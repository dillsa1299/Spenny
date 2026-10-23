// Auth endpoint tests that assert transactional email payloads via a recording sender.
using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Spenny.Api.Auth.Email;
using Spenny.Api.Tests.Support;

namespace Spenny.Api.Tests.Auth.Email;

public class TransactionalEmailAuthEndpointsTests
{
    [Fact]
    public async Task Register_SendsConfirmationLinkToRecordingSender()
    {
        var recording = new RecordingTransactionalEmailSender();
        await using var factory = new AuthWebApplicationFactory(configureTestServices: services =>
        {
            services.RemoveAll<ITransactionalEmailSender>();
            services.AddSingleton<ITransactionalEmailSender>(recording);
        });

        using var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email = "capture@example.com",
            password = "password123",
            displayName = "Capture",
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Single(recording.Sent);
        var sent = recording.Sent[0];
        Assert.Equal("confirm", sent.Kind);
        Assert.Equal("capture@example.com", sent.Email);
        Assert.Contains("/verify-email", sent.Link, StringComparison.Ordinal);
        Assert.Contains("userId=", sent.Link, StringComparison.Ordinal);
        Assert.Contains("token=", sent.Link, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Register_Returns503WhenSenderThrows()
    {
        var recording = new RecordingTransactionalEmailSender(_ => throw new InvalidOperationException("smtp down"));
        await using var factory = new AuthWebApplicationFactory(configureTestServices: services =>
        {
            services.RemoveAll<ITransactionalEmailSender>();
            services.AddSingleton<ITransactionalEmailSender>(recording);
        });

        using var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email = "fail@example.com",
            password = "password123",
            displayName = "Fail",
        });

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<MessageResponse>();
        Assert.Contains("verification email", body?.message ?? string.Empty, StringComparison.OrdinalIgnoreCase);
    }

    private sealed record MessageResponse(string message);
}
