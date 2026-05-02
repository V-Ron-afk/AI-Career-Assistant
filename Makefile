# AI Career Assistant — Developer shortcuts

.PHONY: help up down build logs shell-backend shell-db migrate test lint

help:
	@echo "Available commands:"
	@echo "  make up          — Start all services"
	@echo "  make down        — Stop all services"
	@echo "  make build       — Rebuild Docker images"
	@echo "  make logs        — Tail all logs"
	@echo "  make migrate     — Run Alembic migrations"
	@echo "  make test        — Run backend tests"
	@echo "  make shell-backend — Open shell in backend container"
	@echo "  make shell-db      — Open psql in DB container"
	@echo "  make lint        — Run ruff linter on backend"

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose up --build -d

logs:
	docker compose logs -f

migrate:
	docker compose exec backend alembic upgrade head

test:
	docker compose exec backend pytest tests/ -v

lint:
	docker compose exec backend ruff check app/

shell-backend:
	docker compose exec backend bash

shell-db:
	docker compose exec db psql -U postgres -d career_assistant

# Local dev (no Docker)
dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

install-backend:
	cd backend && pip install -r requirements.txt

install-frontend:
	cd frontend && npm install
