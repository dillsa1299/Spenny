# Self-hosted deployment (GitHub Actions)

Deploy Spenny to your own server with **full deploy logs in GitHub Actions**. Development deploys automatically after [CI](../../.github/workflows/ci.yml) passes on a push to `main`. Production deploys only when you run [Deploy production](../../.github/workflows/deploy-production.yml) manually.

Tracked in GitHub issue [#29](https://github.com/dillsa1299/Spenny/issues/29).

## How it works

- **CI** stays on GitHub-hosted `ubuntu-24.04` (tests + compose smoke).
- **Deploy jobs** run on a **self-hosted runner** on your homeserver (`runs-on: [self-hosted, spenny]`).
- Each deploy runs `docker compose ... up -d --build` on the server; output streams to the Actions run log.
- **Development** (`spenny-dev`) and **production** (`spenny-prod`) are separate Compose projects with separate Postgres volumes and config.
- Deploy config is stored in GitHub **Environment** secret **`SPENNY_DOTENV`** (full `.env` contents per environment), written to a temp file on each deploy run.

Do **not** attach the self-hosted runner to PR workflows from forks. Use it only for the deploy workflows in this repo.

## 1. Homeserver prerequisites

- Linux host with **Docker Engine** and **Compose v2** (deploy overlay uses Compose `!reset` for Postgres ports; use a current Compose 2.x).
- Outbound HTTPS to `github.com` (the runner polls GitHub; no inbound SSH required for deploy).
- `curl` available on the runner host (health checks).

Optional: **Caddy** or **Traefik** on the host for TLS and hostnames (`dev.example.com` → dev client port, `app.example.com` → prod). See [ADR 0001](../adr/0001-defer-access-control-to-hosting-edge.md) before exposing real user data publicly.

## 2. Register a self-hosted runner

1. In GitHub: **Settings → Actions → Runners → New self-hosted runner** (repo or org).
2. On the server, follow the download/configure steps GitHub shows. Suggested extra label: `spenny` (workflows expect `runs-on: [self-hosted, spenny]`).
3. Install the runner as a **systemd service** so it survives reboots: [Configure as a service](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/configuring-the-self-hosted-runner-application-as-a-service).

The runner user must be able to run `docker compose` (often: add the user to the `docker` group).

## 3. Deploy configuration (GitHub Environments)

Template: [`.env.deploy.example`](../../.env.deploy.example). Build **two** variants (dev and prod) with different ports, URLs, and passwords.

| Setting | Development example | Production example |
|--------|---------------------|--------------------|
| `SPENNY_CLIENT_HOST_PORT` | `8080` | `8081` |
| `ASPNETCORE_ENVIRONMENT` | `Development` | `Production` |
| `Auth__SpaBaseUrl` | `https://dev.example.com` | `https://app.example.com` |
| `POSTGRES_PASSWORD` | unique | unique |
| `Email__SmtpHost` | optional (omit → verification links in API logs) | **required** (ESP SMTP relay) |
| `Email__SmtpPort` | `1025` if using local Mailpit; else `587` | `587` (or provider default) |
| `Email__UseSsl` | `false` for Mailpit; `true` for typical ESP | `true` |
| `Email__SmtpUser` | ESP API user / SMTP login | same |
| `Email__SmtpPassword` | ESP SMTP password or API key | same |
| `Email__FromAddress` | `noreply@localhost` (Mailpit) or verified sender | verified sender at your domain |
| `Email__FromName` | `Spenny` | `Spenny` |

**Transactional email:** Local accounts need verification and password-reset mail. In **Production**, the API refuses to start if `Email__SmtpHost` is missing while PostgreSQL auth is enabled. Use any SMTP-capable provider (Brevo, Mailjet, SendGrid, etc.); configure SPF/DKIM at the provider. Do not commit credentials — keep them only in `SPENNY_DOTENV`.

Google OAuth redirect URI per environment: `{Auth__SpaBaseUrl}/api/auth/google/callback`.

In the repo: **Settings → Environments**

| Name | Used by | Secret |
|------|---------|--------|
| `development` | [deploy-development.yml](../../.github/workflows/deploy-development.yml) | **`SPENNY_DOTENV`** — entire dev `.env` body (multiline) |
| `production` | [deploy-production.yml](../../.github/workflows/deploy-production.yml) | **`SPENNY_DOTENV`** — entire prod `.env` body (multiline) |

Same secret **name** in each environment; values are independent. To add or change a variable, edit the secret in GitHub and redeploy (merge to `main` for dev, or run **Deploy production**). No SSH required for routine config changes.

If you already have `/opt/spenny/dev/.env` on the server, copy its contents into the matching GitHub secret once, then use GitHub as the source of truth.

**Updating `SPENNY_DOTENV`:** Environment → choose `development` or `production` → **Secrets** → add or update **`SPENNY_DOTENV`**. Paste key=value lines only (comments from the example file are optional and may be omitted).

## 4. GitHub Environment protection (optional)

| Name | Suggestion |
|------|------------|
| `development` | No extra gates |
| `production` | Optional required reviewers before deploy jobs run |

## 5. First deploy (smoke test)

1. Set **`SPENNY_DOTENV`** on the **development** environment (see §3).
2. Ensure the self-hosted runner is online.
3. Merge to `main` (or re-run **Deploy development** after a successful CI run on `main`).

For a one-off manual deploy on the server without Actions, save your env to a file and run:

```bash
export SPENNY_ENV_FILE=/path/to/your.env
docker compose \
  -f compose/docker-compose.yml \
  -f compose/docker-compose.deploy.yml \
  --env-file "$SPENNY_ENV_FILE" \
  -p spenny-dev \
  up -d --build
curl -sf "http://127.0.0.1:8080/api/health"   # port from SPENNY_CLIENT_HOST_PORT
```

## 6. Production deploy

**Actions → Deploy production → Run workflow**

- **git_ref**: branch or tag (default `main`)
- **confirm**: type `deploy`

## 7. Logs and rollback

- **Logs**: open the failed or successful Actions run; deploy steps include `docker compose` build output. On failure, the workflow prints `docker compose logs`.
- **Rollback**: run **Deploy production** again with an older `git_ref`, or on the server checkout that SHA and re-run the same `docker compose ... up -d --build` command.

## Security checklist

- Runner used only for deploy workflows (CI remains on GitHub-hosted runners).
- Branch protection on `main` with required CI status checks.
- TLS / edge controls per ADR 0001 for public deployments.
- Separate dev and prod databases (separate Compose project names).
