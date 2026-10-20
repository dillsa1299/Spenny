# Self-hosted deployment (GitHub Actions)

Deploy Spenny to your own server with **full deploy logs in GitHub Actions**. Development deploys automatically after [CI](../../.github/workflows/ci.yml) passes on a push to `main`. Production deploys only when you run [Deploy production](../../.github/workflows/deploy-production.yml) manually.

Tracked in GitHub issue [#29](https://github.com/dillsa1299/Spenny/issues/29).

## How it works

- **CI** stays on GitHub-hosted `ubuntu-24.04` (tests + compose smoke).
- **Deploy jobs** run on a **self-hosted runner** on your homeserver (`runs-on: [self-hosted, spenny]`).
- Each deploy runs `docker compose ... up -d --build` on the server; output streams to the Actions run log.
- **Development** (`spenny-dev`) and **production** (`spenny-prod`) are separate Compose projects with separate Postgres volumes and env files.

Do **not** attach the self-hosted runner to PR workflows from forks. Use it only for the deploy workflows in this repo.

## 1. Homeserver prerequisites

- Linux host with **Docker Engine** and **Compose v2** (deploy overlay uses Compose `!reset` for Postgres ports; use a current Compose 2.x).
- Outbound HTTPS to `github.com` (the runner polls GitHub; no inbound SSH required for deploy).
- `curl` available on the runner host (health checks).

Directory layout:

```text
/opt/spenny/
  dev/.env      # copy from .env.deploy.example
  prod/.env     # different secrets, ports, Auth__SpaBaseUrl
```

Optional: **Caddy** or **Traefik** on the host for TLS and hostnames (`dev.example.com` → dev client port, `app.example.com` → prod). See [ADR 0001](../adr/0001-defer-access-control-to-hosting-edge.md) before exposing real user data publicly.

## 2. Register a self-hosted runner

1. In GitHub: **Settings → Actions → Runners → New self-hosted runner** (repo or org).
2. On the server, follow the download/configure steps GitHub shows. Suggested extra label: `spenny` (workflows expect `runs-on: [self-hosted, spenny]`).
3. Install the runner as a **systemd service** so it survives reboots: [Configure as a service](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/configuring-the-self-hosted-runner-application-as-a-service).

The runner user must be able to run `docker compose` (often: add the user to the `docker` group).

## 3. Environment files on the server

Copy [`.env.deploy.example`](../../.env.deploy.example) to each path:

```bash
sudo mkdir -p /opt/spenny/dev /opt/spenny/prod
sudo cp .env.deploy.example /opt/spenny/dev/.env
sudo cp .env.deploy.example /opt/spenny/prod/.env
# edit both — unique passwords, Auth__SpaBaseUrl, SPENNY_CLIENT_HOST_PORT
```

| Setting | Development example | Production example |
|--------|---------------------|--------------------|
| `SPENNY_CLIENT_HOST_PORT` | `8080` | `8081` |
| `Auth__SpaBaseUrl` | `https://dev.example.com` | `https://app.example.com` |
| `POSTGRES_PASSWORD` | unique | unique |

Google OAuth redirect URI per environment: `{Auth__SpaBaseUrl}/api/auth/google/callback`.

Restrict file permissions: `chmod 600 /opt/spenny/*/.env`.

## 4. GitHub Environments

In the repo: **Settings → Environments**

| Name | Used by | Suggestion |
|------|---------|------------|
| `development` | [deploy-development.yml](../../.github/workflows/deploy-development.yml) | No extra gates |
| `production` | [deploy-production.yml](../../.github/workflows/deploy-production.yml) | Optional required reviewers |

Secrets in server `.env` files are enough for v1; add environment secrets only if workflows need them later.

## 5. First manual deploy (smoke test)

On the server, from a clone at the commit you want:

```bash
git clone https://github.com/dillsa1299/Spenny.git
cd Spenny
docker compose \
  -f compose/docker-compose.yml \
  -f compose/docker-compose.deploy.yml \
  --env-file /opt/spenny/dev/.env \
  -p spenny-dev \
  up -d --build
curl -sf "http://127.0.0.1:8080/api/health"   # port from SPENNY_CLIENT_HOST_PORT
```

After the runner is online, merge to `main` and confirm a **Deploy development** run appears under Actions with build output.

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
