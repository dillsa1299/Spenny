// Registers Identity, cookies, email, optional Google OAuth, and domain authorization when a database is available.
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Spenny.Api.Auth.Access;
using Spenny.Api.Auth.Email;
using Spenny.Api.Auth.Google;
using Spenny.Api.Auth.Identity;
using Spenny.Api.Auth.Options;
using Spenny.Api.Data;

namespace Spenny.Api.Auth.DependencyInjection;

public static class AuthServiceExtensions
{
    public const string AuthCookieName = "spenny.auth";

    private sealed class AuthServicesRegistered;

    public static IServiceCollection AddSpennyAuth(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOptions<AuthAppSettings>()
            .BindConfiguration(AuthAppSettings.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddSingleton<IValidateOptions<EmailSettings>, EmailSettingsValidator>();
        services.AddOptions<EmailSettings>()
            .BindConfiguration(EmailSettings.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddHttpContextAccessor();

        services.AddIdentityCore<SpennyUser>(options =>
            {
                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedEmail = true;
            })
            .AddEntityFrameworkStores<SpennyDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders();

        var authentication = services.AddAuthentication(options =>
            {
                options.DefaultScheme = IdentityConstants.ApplicationScheme;
                options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
            })
            .AddCookie(IdentityConstants.ApplicationScheme, options =>
            {
                options.Cookie.Name = AuthCookieName;
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
                options.SlidingExpiration = true;
                options.ExpireTimeSpan = TimeSpan.FromDays(14);
                options.Events.OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return Task.CompletedTask;
                };
                options.Events.OnRedirectToAccessDenied = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    return Task.CompletedTask;
                };
            });

        var googleSettings = configuration.GetSection(GoogleAuthSettings.SectionName).Get<GoogleAuthSettings>();
        if (googleSettings?.IsConfigured == true)
        {
            services.Configure<GoogleAuthSettings>(configuration.GetSection(GoogleAuthSettings.SectionName));

            authentication
                .AddCookie(IdentityConstants.ExternalScheme, options =>
                {
                    options.Cookie.Name = "spenny.auth.external";
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SameSite = SameSiteMode.Lax;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
                })
                .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
                {
                    options.ClientId = googleSettings.ClientId!;
                    options.ClientSecret = googleSettings.ClientSecret!;
                    // Must sit under /api so the Vite dev proxy forwards Google's redirect to the API.
                    options.CallbackPath = GoogleOAuthUrls.CallbackPath;
                });

            services.AddSingleton<GoogleAuthServicesRegistered>();
        }

        services.AddDomainAccessAuthorization();

        var emailSettings = configuration.GetSection(EmailSettings.SectionName).Get<EmailSettings>();
        if (!string.IsNullOrWhiteSpace(emailSettings?.SmtpHost))
        {
            services.AddSingleton<ITransactionalEmailSender, SmtpTransactionalEmailSender>();
        }
        else
        {
            services.AddSingleton<ITransactionalEmailSender, LoggingTransactionalEmailSender>();
        }

        services.AddSingleton<AuthServicesRegistered>();

        return services;
    }

    public static bool IsAuthConfigured(this IServiceProvider services)
    {
        return services.GetService<AuthServicesRegistered>() is not null;
    }
}
