// Integration tests for GET /api/time: anonymous access returns the time payload and the per-IP rate limit returns 429.
using System.Net;
using System.Net.Http.Json;

namespace Spenny.Api.Tests;

public class TimeEndpointTests
{
    [Fact]
    public async Task GetTime_WithoutCredentials_Returns200AndTimePayload()
    {
        await using var factory = new SpennyWebApplicationFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/time");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<TimeResponse>();
        Assert.NotNull(body);
        Assert.True(DateTimeOffset.TryParse(body.utc, out _));
        Assert.True(DateTimeOffset.TryParse(body.local, out _));
        Assert.False(string.IsNullOrWhiteSpace(body.timeZoneId));
    }

    [Fact]
    public async Task GetTime_BeyondRateLimit_Returns429()
    {
        const int permitLimit = 2;
        await using var factory = new SpennyWebApplicationFactory(permitLimit);
        using var client = factory.CreateClient();

        for (var i = 0; i < permitLimit; i++)
        {
            var allowed = await client.GetAsync("/api/time");
            Assert.Equal(HttpStatusCode.OK, allowed.StatusCode);
        }

        var rejected = await client.GetAsync("/api/time");

        Assert.Equal(HttpStatusCode.TooManyRequests, rejected.StatusCode);
    }

    private sealed record TimeResponse(string utc, string local, string timeZoneId);
}
