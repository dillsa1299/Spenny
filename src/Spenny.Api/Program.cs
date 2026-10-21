// Spenny Web API entry point: per-IP rate limiting on /api, optional PostgreSQL (EF Core), dev-only CORS for the local SPA.
// Anonymous health + rate-limited /api; domain routes require auth per ADR 0003.
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using Spenny.Api;
using Spenny.Api.Auth.Access;
using Spenny.Api.Auth.DependencyInjection;
using Spenny.Api.Auth.Endpoints;
using Spenny.Api.Configuration;
using Spenny.Api.Data;
using Spenny.Api.Admin;
using Spenny.Api.Spending;

EnvFileBootstrap.LoadForCurrentProcess();

var builder = WebApplication.CreateBuilder(args);

const string corsPolicyName = "SpennySpaDev";
const string apiRateLimitPolicy = "api";

builder.Services.AddOptions<RateLimitSettings>()
    .BindConfiguration(RateLimitSettings.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddRateLimiter(options => options.RejectionStatusCode = StatusCodes.Status429TooManyRequests);

// Trust X-Forwarded-* from the SPA nginx container so OAuth redirect_uri uses https behind TLS termination.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

// Settings are read through IOptions so test hosts can override them after Program builds its configuration.
builder.Services.AddOptions<RateLimiterOptions>()
    .Configure<IOptions<RateLimitSettings>>((options, settings) =>
    {
        var limit = settings.Value;

        // shortcut: keyed on remote IP, which is the proxy address behind a reverse proxy; configure
        // forwarded headers (and trusted proxies) when deploying behind one.
        options.AddPolicy(apiRateLimitPolicy, context =>
            RateLimitPartition.GetFixedWindowLimiter(
                context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = limit.PermitLimit,
                    Window = TimeSpan.FromSeconds(limit.WindowSeconds),
                    QueueLimit = 0,
                }));
    });

builder.Services.AddSpennyDatabase(builder.Configuration);
if (!string.IsNullOrWhiteSpace(builder.Configuration.GetConnectionString(DatabaseBootstrap.ConnectionStringName)))
{
    builder.Services.AddSpennyAuth(builder.Configuration);
}

builder.Services.AddAuthorization();
builder.Services.AddSingleton(TimeProvider.System);

builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicyName, policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.ApplyMigrationsIfConfigured();

app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
{
    app.UseCors(corsPolicyName);
}
else
{
    app.UseHttpsRedirection();
}
app.UseRateLimiter();

if (app.Services.IsAuthConfigured())
{
    app.UseAuthentication();
}

app.UseAuthorization();

// Lets the SPA read ASP.NET Core environment on routes that share Cloudflare Access with the app (health may not).
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api"))
    {
        context.Response.Headers["X-Spenny-Environment"] = app.Environment.EnvironmentName;
    }

    await next();
});

var api = app.MapGroup("/api").RequireRateLimiting(apiRateLimitPolicy);

if (app.Services.IsAuthConfigured())
{
    api.MapSpennyAuthEndpoints();
    api.MapSpennyProfileEndpoints();
    api.MapGoogleAuthEndpoints();
}

api.MapGet("/health", (IHostEnvironment environment) =>
        Results.Ok(new { status = "ok", environment = environment.EnvironmentName }))
    .AllowAnonymous()
    .WithName("GetHealth");

if (app.Services.IsAuthConfigured())
{
    api.MapGet("/domain/access-check", () => Results.Ok(new { domain = "ready" }))
        .RequireAuthorization(DomainAccessAuthorization.PolicyName)
        .WithName("DomainAccessCheck");

    api.MapSpendingEndpoints();
    api.MapAdminEndpoints();
}

app.Run();

public partial class Program;
