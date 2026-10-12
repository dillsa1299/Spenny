// Test host with in-memory SQLite so Identity and auth endpoints run without PostgreSQL.
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Spenny.Api.Auth;
using Spenny.Api.Data;

namespace Spenny.Api.Tests;

public sealed class AuthWebApplicationFactory : WebApplicationFactory<Program>, IDisposable
{
    private readonly SqliteConnection _connection = new("DataSource=spenny-auth-tests;Mode=Memory;Cache=Shared");

    public AuthWebApplicationFactory()
    {
        _connection.Open();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("RateLimit:PermitLimit", "1000");
        builder.UseSetting("RateLimit:WindowSeconds", "60");
        builder.UseSetting($"ConnectionStrings:{DatabaseBootstrap.ConnectionStringName}", string.Empty);

        builder.ConfigureServices((context, services) =>
        {
            services.AddDbContext<SpennyDbContext>(options => options.UseSqlite(_connection));
            services.AddSpennyAuth(context.Configuration);
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);
        using var scope = host.Services.CreateScope();
        scope.ServiceProvider.GetRequiredService<SpennyDbContext>().Database.EnsureCreated();
        return host;
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _connection.Dispose();
        }

        base.Dispose(disposing);
    }
}
