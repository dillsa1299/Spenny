# Ensures Compose Postgres + Mailpit for local dev; no-op when services are already healthy.
# Invoked from Directory.Build.targets when debugging from Visual Studio (F5).
$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$composeFile = Join-Path $repoRoot 'compose\docker-compose.yml'
$envFile = Join-Path $repoRoot '.env'

if (-not (Test-Path $envFile)) {
    $legacyEnv = Join-Path $repoRoot 'compose\.env'
    if (Test-Path $legacyEnv) {
        Write-Host 'ensure-postgres: migrating compose/.env to repo-root .env'
        Copy-Item $legacyEnv $envFile
    }
    else {
        Write-Host 'ensure-postgres: .env missing; copying from .env.example'
        Copy-Item (Join-Path $repoRoot '.env.example') $envFile
    }
}

Write-Host 'ensure-postgres: ensuring Docker Compose services (postgres, mailpit)...'
docker compose -f $composeFile --env-file $envFile up -d

if ($LASTEXITCODE -ne 0) {
    Write-Error 'ensure-postgres: docker compose failed'
}

$deadline = (Get-Date).AddSeconds(60)
while ((Get-Date) -lt $deadline) {
    $health = docker inspect -f '{{.State.Health.Status}}' spenny-postgres 2>$null
    if ($health -eq 'healthy') {
        Write-Host 'ensure-postgres: PostgreSQL is healthy'
        Write-Host 'ensure-postgres: Mailpit UI http://localhost:8025 (SMTP localhost:1025)'
        exit 0
    }

    $running = docker inspect -f '{{.State.Running}}' spenny-postgres 2>$null
    if ($running -eq 'true' -and [string]::IsNullOrEmpty($health)) {
        Write-Host 'ensure-postgres: container running (no health report yet)'
        Write-Host 'ensure-postgres: Mailpit UI http://localhost:8025 (SMTP localhost:1025)'
        exit 0
    }

    Start-Sleep -Seconds 2
}

Write-Error 'ensure-postgres: timed out waiting for PostgreSQL'
