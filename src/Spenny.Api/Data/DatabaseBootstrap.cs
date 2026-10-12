// Registers PostgreSQL via EF Core when a connection string is configured, and applies pending migrations at startup.
using Microsoft.EntityFrameworkCore;

namespace Spenny.Api.Data;

public static class DatabaseBootstrap
{
    public const string ConnectionStringName = "Default";

    public static IServiceCollection AddSpennyDatabase(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString(ConnectionStringName);
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return services;
        }

        services.AddDbContext<SpennyDbContext>(options =>
            options.UseNpgsql(connectionString));

        return services;
    }

    public static void ApplyMigrationsIfConfigured(this WebApplication app)
    {
        var connectionString = app.Configuration.GetConnectionString(ConnectionStringName);
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return;
        }

        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SpennyDbContext>();
        db.Database.Migrate();
    }
}
