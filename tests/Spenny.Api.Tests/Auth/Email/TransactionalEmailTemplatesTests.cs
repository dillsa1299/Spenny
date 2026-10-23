// Ensures transactional HTML mail encodes user content and includes branded layout markers.
using Spenny.Api.Auth.Email;

namespace Spenny.Api.Tests.Auth.Email;

public class TransactionalEmailTemplatesTests
{
    [Fact]
    public void EmailConfirmation_HtmlEncodesDisplayName_AndIncludesButton()
    {
        var (_, html) = TransactionalEmailTemplates.EmailConfirmation(
            "<script>alert(1)</script>",
            "https://app.example.com/verify-email?userId=1&token=abc");

        Assert.DoesNotContain("<script>", html, StringComparison.Ordinal);
        Assert.Contains("Confirm email", html, StringComparison.Ordinal);
        Assert.Contains("#52b788", html, StringComparison.Ordinal);
        Assert.Contains("#0d1117", html, StringComparison.Ordinal);
    }
}
