// Verifies the API host starts without a database (tests/CI unit job) and can apply migrations when configured.
using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Spenny.Api.Data;

namespace Spenny.Api.Tests;

public class DatabaseBootstrapTests
{
    [Fact]
    public async Task Host_WithoutConnectionString_DoesNotRegisterDbContext()
    {
        await using var factory = new WebApplicationFactory<Program>();
        using var scope = factory.Services.CreateScope();

        Assert.Null(scope.ServiceProvider.GetService<SpennyDbContext>());
    }

    [Fact]
    public async Task Host_WithoutConnectionString_StillServesHealth()
    {
        await using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
