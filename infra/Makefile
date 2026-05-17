COMPOSE = docker compose \
  -f docker-compose.yml \
  -f supabase/docker-compose.yml \
  --env-file ../.env

.PHONY: up down restart logs ps pull build

## Start all services in the background
up:
	$(COMPOSE) up -d

## Stop all services
down:
	$(COMPOSE) down

## Restart a single service: make restart svc=nextjs
restart:
	$(COMPOSE) restart $(svc)

## Stream logs (all services, or: make logs svc=nextjs)
logs:
	$(COMPOSE) logs -f $(svc)

## Show running containers
ps:
	$(COMPOSE) ps

## Pull latest images (does not rebuild nextjs)
pull:
	$(COMPOSE) pull discourse discourse-postgres discourse-redis nginx

## Rebuild and restart Next.js after code changes
build:
	$(COMPOSE) build nextjs
	$(COMPOSE) up -d --no-deps nextjs
