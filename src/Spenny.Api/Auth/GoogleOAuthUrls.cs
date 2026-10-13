// Google OAuth paths: CallbackPath is handled by the Google middleware and must be registered in Google Cloud;
// CompletePath is the app endpoint the middleware redirects to after storing the external login.
namespace Spenny.Api.Auth;

public static class GoogleOAuthUrls
{
    public const string CallbackPath = "/api/auth/google/callback";

    public const string CompletePath = "/api/auth/google/complete";

    public static string BuildCallbackUrl(string spaBaseUrl) =>
        $"{spaBaseUrl.TrimEnd('/')}{CallbackPath}";
}
