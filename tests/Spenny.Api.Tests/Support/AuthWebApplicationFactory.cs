// Test host with in-memory SQLite so Identity and auth endpoints run without PostgreSQL.
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Spenny.Api.Auth.DependencyInjection;
using Spenny.Api.Data;

namespace Spenny.Api.Tests.Support;

public class AuthWebApplicationFactory : WebApplicationFactory<Program>, IDisposable
{
    private readonly SqliteConnection _connection = new($"DataSource=spenny-auth-{Guid.NewGuid():N};Mode=Memory;Cache=Shared");
    private readonly bool _googleConfigured;
    private readonly Action<IServiceCollection>? _configureTestServices;

    public AuthWebApplicationFactory(
        bool googleConfigured = false,
        Action<IServiceCollection>? configureTestServices = null)
    {
        _googleConfigured = googleConfigured;
        _configureTestServices = configureTestServices;
        _connection.Open();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        if (_googleConfigured)
        {
            builder.UseSetting("Authentication:Google:ClientId", "test-client-id");
            builder.UseSetting("Authentication:Google:ClientSecret", "test-client-secret");
        }

        builder.UseSetting("RateLimit:PermitLimit", "1000");
        builder.UseSetting("RateLimit:WindowSeconds", "60");
        builder.UseSetting($"ConnectionStrings:{DatabaseBootstrap.ConnectionStringName}", string.Empty);

        builder.ConfigureServices((context, services) =>
        {
            services.AddDbContext<SpennyDbContext>(options => options.UseSqlite(_connection));
            services.AddSpennyAuth(context.Configuration);
            _configureTestServices?.Invoke(services);
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
