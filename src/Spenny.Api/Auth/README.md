# Authentication and domain access

| Folder | Purpose |
|--------|---------|
| **Identity/** | `SpennyUser`, `AuthProviderKind`, login audit entity |
| **Endpoints/** | Local and Google HTTP routes (`/api/auth/*`) |
| **Google/** | OAuth settings and callback paths |
| **Email/** | Verification and password-reset mail |
| **Access/** | Domain API policy (verified email / Google) |
| **Options/** | SPA URL and related auth configuration |
| **DependencyInjection/** | `AddSpennyAuth` registration |
