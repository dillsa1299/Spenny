// HTML and plain-text bodies for verification and password-reset mail (colors match Spenny.Client theme).
using System.Net;

namespace Spenny.Api.Auth.Email;

internal static class TransactionalEmailTemplates
{
    // Mirrors src/Spenny.Client/src/theme/theme.ts palette.
    private const string BgDefault = "#0d1117";
    private const string BgPaper = "#161b22";
    private const string TextPrimary = "#e6edf3";
    private const string TextMuted = "#8b949e";
    private const string PrimaryGreen = "#52b788";
    private const string PrimaryGreenHover = "#40916c";

    public static (string PlainText, string Html) EmailConfirmation(string displayName, string actionLink)
    {
        var safeName = WebUtility.HtmlEncode(displayName);
        var safeLink = WebUtility.HtmlEncode(actionLink);

        var plain = $"""
            Hi {displayName},

            Confirm your Spenny account by opening this link:

            {actionLink}

            If you did not create an account, you can ignore this message.
            """;

        var html = WrapLayout(
            greeting: safeName,
            lead: "Confirm your Spenny account using the button below.",
            buttonLabel: "Confirm email",
            actionLink: safeLink,
            footer: "If you did not create an account, you can ignore this message.");

        return (plain, html);
    }

    public static (string PlainText, string Html) PasswordReset(string displayName, string actionLink)
    {
        var safeName = WebUtility.HtmlEncode(displayName);
        var safeLink = WebUtility.HtmlEncode(actionLink);

        var plain = $"""
            Hi {displayName},

            Reset your Spenny password using this link:

            {actionLink}

            If you did not request a reset, you can ignore this message.
            """;

        var html = WrapLayout(
            greeting: safeName,
            lead: "Reset your Spenny password using the button below.",
            buttonLabel: "Reset password",
            actionLink: safeLink,
            footer: "If you did not request a reset, you can ignore this message.");

        return (plain, html);
    }

    private static string WrapLayout(
        string greeting,
        string lead,
        string buttonLabel,
        string actionLink,
        string footer)
    {
        return $"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <meta name="color-scheme" content="dark" />
              <title>Spenny</title>
            </head>
            <body style="margin:0;padding:0;background-color:{BgDefault};font-family:system-ui,'Segoe UI',sans-serif;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:{BgDefault};padding:32px 16px;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background-color:{BgPaper};border-radius:12px;padding:32px 28px;">
                      <tr>
                        <td style="color:{TextPrimary};font-size:22px;font-weight:700;letter-spacing:-0.02em;padding-bottom:8px;">
                          Spenny
                        </td>
                      </tr>
                      <tr>
                        <td style="color:{TextPrimary};font-size:16px;line-height:1.5;padding-bottom:12px;">
                          Hi {greeting},
                        </td>
                      </tr>
                      <tr>
                        <td style="color:{TextMuted};font-size:15px;line-height:1.5;padding-bottom:24px;">
                          {lead}
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-bottom:24px;">
                          <a href="{actionLink}" style="display:inline-block;background-color:{PrimaryGreen};color:{BgDefault};font-size:16px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:12px;mso-padding-alt:0;">
                            {buttonLabel}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="color:{TextMuted};font-size:13px;line-height:1.5;padding-bottom:16px;">
                          {footer}
                        </td>
                      </tr>
                      <tr>
                        <td style="color:{TextMuted};font-size:12px;line-height:1.5;word-break:break-all;">
                          Or copy this link:<br />
                          <a href="{actionLink}" style="color:{PrimaryGreenHover};text-decoration:underline;">{actionLink}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """;
    }
}
