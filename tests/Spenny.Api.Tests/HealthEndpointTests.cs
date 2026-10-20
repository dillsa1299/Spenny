// Integration tests for GET /api/health and per-IP rate limiting on /api.
using System.Net;
using System.Net.Http.Json;

namespace Spenny.Api.Tests;

public class HealthEndpointTests
{
    [Fact]
    public async Task GetHealth_WithoutCredentials_Returns200AndOkPayload()
    {
        await using var factory = new SpennyWebApplicationFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<HealthResponse>();
        Assert.NotNull(body);
        Assert.Equal("ok", body.status);
        Assert.Equal("Development", body.environment);
    }

    [Fact]
    public async Task GetHealth_BeyondRateLimit_Returns429()
    {
        const int permitLimit = 2;
        await using var factory = new SpennyWebApplicationFactory(permitLimit);
        using var client = factory.CreateClient();

        for (var i = 0; i < permitLimit; i++)
        {
            var allowed = await client.GetAsync("/api/health");
            Assert.Equal(HttpStatusCode.OK, allowed.StatusCode);
        }

        var rejected = await client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.TooManyRequests, rejected.StatusCode);
    }

    private sealed record HealthResponse(string status, string environment);
}
