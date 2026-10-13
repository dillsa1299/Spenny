// Loads repo-root `.env` into process environment before configuration binds (local dev only).
using System.Reflection;

namespace Spenny.Api.Configuration;

public static class EnvFileBootstrap
{
    public static void LoadForCurrentProcess()
    {
        if (IsTestHost())
        {
            return;
        }

        var envPath = FindRepoRootEnvFile();
        if (envPath is null)
        {
            return;
        }

        ApplyFile(envPath);
        ApplyConnectionStringFromPostgresVarsInternal();
    }

    internal static void ApplyConnectionStringFromPostgresVarsInternal()
        => ApplyConnectionStringFromPostgresVars();

    private static bool IsTestHost()
    {
        // dotnet test / VS run tests under "testhost"; a developer .env must not leak into test hosts.
        var entry = Assembly.GetEntryAssembly()?.GetName().Name;
        return entry is not null
            && (entry.Equals("testhost", StringComparison.OrdinalIgnoreCase)
                || entry.EndsWith(".Tests", StringComparison.OrdinalIgnoreCase));
    }

    private static string? FindRepoRootEnvFile()
    {
        foreach (var start in GetSearchRoots())
        {
            var dir = new DirectoryInfo(start);
            while (dir is not null)
            {
                var envFile = Path.Combine(dir.FullName, ".env");
                if (File.Exists(envFile))
                {
                    return envFile;
                }

                if (File.Exists(Path.Combine(dir.FullName, ".env.example"))
                    || File.Exists(Path.Combine(dir.FullName, "Spenny.slnx")))
                {
                    return null;
                }

                dir = dir.Parent;
            }
        }

        return null;
    }

    private static IEnumerable<string> GetSearchRoots()
    {
        yield return Directory.GetCurrentDirectory();

        var baseDir = AppContext.BaseDirectory;
        if (!string.IsNullOrWhiteSpace(baseDir))
        {
            yield return baseDir;
        }
    }

    private static void ApplyFile(string path)
    {
        foreach (var rawLine in File.ReadAllLines(path))
        {
            var line = rawLine.Trim();
            if (line.Length == 0 || line.StartsWith('#'))
            {
                continue;
            }

            var equals = line.IndexOf('=', StringComparison.Ordinal);
            if (equals <= 0)
            {
                continue;
            }

            var key = line[..equals].Trim();
            var value = line[(equals + 1)..].Trim();
            if (key.Length == 0)
            {
                continue;
            }

            value = Unquote(value);

            if (Environment.GetEnvironmentVariable(key) is not null)
            {
                continue;
            }

            Environment.SetEnvironmentVariable(key, value);
        }
    }

    private static string Unquote(string value)
    {
        if (value.Length >= 2
            && ((value[0] == '"' && value[^1] == '"') || (value[0] == '\'' && value[^1] == '\'')))
        {
            return value[1..^1];
        }

        return value;
    }

    private static void ApplyConnectionStringFromPostgresVars()
    {
        const string connectionKey = "ConnectionStrings__Default";
        if (!string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(connectionKey)))
        {
            return;
        }

        var user = Environment.GetEnvironmentVariable("POSTGRES_USER");
        var password = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");
        var database = Environment.GetEnvironmentVariable("POSTGRES_DB");
        if (string.IsNullOrWhiteSpace(user)
            || string.IsNullOrWhiteSpace(password)
            || string.IsNullOrWhiteSpace(database))
        {
            return;
        }

        var host = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";
        var port = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
        Environment.SetEnvironmentVariable(
            connectionKey,
            $"Host={host};Port={port};Database={database};Username={user};Password={password}");
    }
}
