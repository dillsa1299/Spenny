// Regression tests for repo-root .env → connection string mapping.
using Spenny.Api.Configuration;

namespace Spenny.Api.Tests.Configuration;

public class EnvFileBootstrapTests
{
    [Fact]
    public void ApplyConnectionStringFromPostgresVars_BuildsDefault_WhenNotPreset()
    {
        var prior = Environment.GetEnvironmentVariable("ConnectionStrings__Default");
        Environment.SetEnvironmentVariable("ConnectionStrings__Default", null);
        Environment.SetEnvironmentVariable("POSTGRES_USER", "spenny");
        Environment.SetEnvironmentVariable("POSTGRES_PASSWORD", "secret");
        Environment.SetEnvironmentVariable("POSTGRES_DB", "spenny");
        Environment.SetEnvironmentVariable("POSTGRES_HOST", "localhost");
        Environment.SetEnvironmentVariable("POSTGRES_PORT", "5433");

        try
        {
            EnvFileBootstrap.ApplyConnectionStringFromPostgresVarsInternal();

            var built = Environment.GetEnvironmentVariable("ConnectionStrings__Default");
            Assert.Equal(
                "Host=localhost;Port=5433;Database=spenny;Username=spenny;Password=secret",
                built);
        }
        finally
        {
            Environment.SetEnvironmentVariable("ConnectionStrings__Default", prior);
            Environment.SetEnvironmentVariable("POSTGRES_USER", null);
            Environment.SetEnvironmentVariable("POSTGRES_PASSWORD", null);
            Environment.SetEnvironmentVariable("POSTGRES_DB", null);
            Environment.SetEnvironmentVariable("POSTGRES_HOST", null);
            Environment.SetEnvironmentVariable("POSTGRES_PORT", null);
        }
    }
}
