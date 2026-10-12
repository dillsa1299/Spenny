// Design-time factory for `dotnet ef` migrations; uses ConnectionStrings__Default or local Compose defaults.
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Spenny.Api.Data;

public sealed class SpennyDbContextFactory : IDesignTimeDbContextFactory<SpennyDbContext>
{
    public SpennyDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Default")
            ?? "Host=localhost;Port=5432;Database=spenny;Username=spenny;Password=change_me_local_only";

        var options = new DbContextOptionsBuilder<SpennyDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new SpennyDbContext(options);
    }
}
