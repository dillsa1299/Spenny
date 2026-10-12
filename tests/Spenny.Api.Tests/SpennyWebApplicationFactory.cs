// Test host for Spenny.Api with the per-IP rate limit overridable so limit behaviour can be exercised quickly.
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Spenny.Api.Tests;

public sealed class SpennyWebApplicationFactory(int permitLimit = 60) : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("RateLimit:PermitLimit", permitLimit.ToString());
        builder.UseSetting("RateLimit:WindowSeconds", "60");
    }
}
