# Local Development Guide

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 22+ | Use `nvm use 22` if you have nvm |
| Docker Desktop | 4.x+ | Includes Compose v2 |
| ngrok or Cloudflare Tunnel | any | Required for SSO testing (see below) |

## First-time setup

```bash
# 1. Clone and enter the repo
git clone <repo-url>
cd bethlem.co

# 2. Install Node dependencies
nvm use 22
npm install

# 3. Set up environment variables
cp .env.example .env
```

Open `.env` and fill in the required values. For local development, leave the Supabase keys as-is until you start the stack — Supabase generates them during first boot and prints them in the logs.

## Generating Supabase JWT keys

Supabase self-hosted requires three secrets: `POSTGRES_PASSWORD`, `JWT_SECRET`, `ANON_KEY`, and `SERVICE_ROLE_KEY`. Generate them:

```bash
# Random passwords
openssl rand -base64 32   # POSTGRES_PASSWORD
openssl rand -base64 32   # JWT_SECRET
openssl rand -base64 32   # DISCOURSE_SSO_SECRET
openssl rand -base64 32   # DISCOURSE_DB_PASSWORD
```

For `ANON_KEY` and `SERVICE_ROLE_KEY`, use the Supabase key generator:
→ https://supabase.com/docs/guides/self-hosting#api-keys

Copy the values into both `.env` (root) and `infra/supabase/.env`.

## Running the full stack

```bash
cd infra
make up          # start everything in the background
make logs        # stream all logs
make logs svc=nextjs  # stream logs for one service
make ps          # see status of all containers
make down        # stop everything
```

**First-boot notes:**
- **Supabase** takes ~1 minute to initialise all services.
- **Discourse** runs `db:migrate` and precompiles assets on first boot — expect **5–10 minutes** before the forum is reachable. This is normal; do not restart the container.

## Running Next.js for development

You can run Next.js outside Docker while the other services run in containers:

```bash
# Forward Supabase Kong to localhost:8000
docker port supabase-kong  # or just hardcode 8000

# In .env, point Supabase at localhost
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000

npm run dev   # http://localhost:3000
```

## Testing DiscourseConnect SSO locally

Discourse's SSO redirect **must point to a public HTTPS URL** — it will not redirect back to `localhost`. Use ngrok or Cloudflare Tunnel:

```bash
# Install ngrok: https://ngrok.com/download (free tier works)
ngrok http 3000
# → Forwarding: https://abc123.ngrok-free.app -> localhost:3000
```

Then update `.env`:
```
NEXT_PUBLIC_SITE_URL=https://abc123.ngrok-free.app
DISCOURSE_SSO_URL=https://abc123.ngrok-free.app/api/auth/discourse-sso
```

And restart Discourse so it picks up the new SSO URL:
```bash
cd infra && make restart svc=discourse
```

## Accessing Supabase Studio

Studio is **not exposed publicly**. Access it via port-forward:

```bash
# In a separate terminal
ssh -L 54323:localhost:54323 user@your-vps
# Open http://localhost:54323 in your browser
```

For local Docker: Studio is already on `localhost:54323` (check `docker ps` for the exact port).

## Running the profiles migration

After Supabase is running:

```bash
docker exec -i supabase-db \
  psql -U postgres -d postgres \
  < infra/supabase/volumes/db/migrations/20240101_profiles.sql
```

## Discourse admin setup (first boot)

Bitnami Discourse creates an admin using `DISCOURSE_USERNAME` / `DISCOURSE_PASSWORD` / `DISCOURSE_EMAIL` from the compose env. However, the account may need activation:

```bash
docker exec -it bethlem-discourse-1 \
  /opt/bitnami/discourse/bin/bundle exec rails runner \
  "User.find_by_username('admin')&.activate!"
```

**Important:** Leave `DISCOURSE_ENABLE_LOCAL_LOGINS=true` until you have confirmed that the full SSO flow works end-to-end (sign in on bethlem.co → redirected to forum.bethlem.co with an account). Only then set it to `"false"` and restart Discourse.

## Applying code changes to the Docker build

After editing Next.js source:

```bash
cd infra && make build
```

This rebuilds the `nextjs` container image and hot-swaps it without restarting other services.

## SSL certificates (production VPS only)

Certificates are not needed for local development. On the VPS, obtain them with Certbot before starting nginx:

```bash
# Stop nginx if running
cd infra && make down

# Get certificates
certbot certonly --standalone \
  -d bethlem.co -d www.bethlem.co -d forum.bethlem.co

# Then start everything
make up
```

Certbot auto-renews via a systemd timer. Nginx will pick up renewed certs on the next reload (`make restart svc=nginx`).
