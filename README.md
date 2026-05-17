# bethlem.co

Community site and forum for people living with [Bethlem Myopathy](https://en.wikipedia.org/wiki/Bethlem_myopathy) — a rare, slowly progressive muscle disease affecting roughly 1 in 200,000 people.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router, TypeScript) |
| Forum | Discourse (self-hosted, bitnami/discourse:3) |
| Auth + DB | Supabase (self-hosted — GoTrue + PostgreSQL) |
| File storage | Supabase Storage |
| UI | Tailwind CSS v4 + shadcn/ui |
| Proxy | Nginx |
| Deployment | Docker Compose on a single VPS |

## How it fits together

```
bethlem.co  ──────► Next.js (main site, auth pages)
                        │
                        │  DiscourseConnect SSO
                        ▼
forum.bethlem.co ──► Discourse (forum)

Both services share Supabase Auth as the identity provider.
Users sign in once on bethlem.co and are transparently logged into the forum.
```

**Auth flow:**
1. User visits `forum.bethlem.co` and clicks Sign In
2. Discourse redirects to `bethlem.co/api/auth/discourse-sso`
3. Next.js checks the Supabase session — redirects to `/auth/login` if not signed in
4. After login (magic link or Google OAuth), Discourse receives a signed user payload and creates/syncs the account

## Project structure

```
bethlem.co/
├── src/
│   ├── app/
│   │   ├── api/auth/discourse-sso/   ← DiscourseConnect SSO endpoint
│   │   ├── auth/                     ← login, callback, signout
│   │   └── page.tsx                  ← homepage
│   ├── components/
│   │   ├── auth/LoginForm.tsx
│   │   └── layout/SiteHeader.tsx
│   └── lib/
│       ├── supabase/                 ← browser + server clients
│       └── discourse/sso.ts          ← HMAC helpers
├── infra/
│   ├── docker-compose.yml            ← nginx + nextjs + discourse services
│   ├── Makefile                      ← up / down / logs / build
│   ├── nginx/nginx.conf
│   └── supabase/                     ← official Supabase docker compose + volumes
│       └── volumes/db/migrations/    ← profiles table + RLS
├── Dockerfile                        ← multi-stage Next.js build
└── docs/local-dev.md                 ← full local dev guide
```

## Getting started

See **[docs/local-dev.md](docs/local-dev.md)** for the full setup guide.

Quick start:

```bash
nvm use 22
npm install
cp .env.example .env   # fill in secrets
cd infra && make up
```

Next.js dev server (while Docker services run in the background):

```bash
npm run dev   # http://localhost:3000
```
