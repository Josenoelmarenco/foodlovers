# Architecture

## Overview

FoodLovers follows a classic three-tier architecture: a React single-page app, an Express REST API, and a PostgreSQL database. Each tier has one job and one job only — this is what gives portfolio readers a clear story to read.

```
┌────────────────────┐     HTTP/JSON     ┌────────────────────┐    SQL/Prisma   ┌──────────────┐
│  Frontend (React)  │ ◄───────────────► │   Backend (Node)   │ ◄─────────────► │  PostgreSQL  │
│  Vite · TS · Tail  │                   │   Express · Prisma │                 │              │
└────────────────────┘                   └────────────────────┘                 └──────────────┘
```

## Why three tiers and not Next.js fullstack?

A monolithic Next.js app would work for the same product, but for a portfolio we deliberately want **clear physical separation**. It makes the architecture readable in one glance, demonstrates that you understand client-server boundaries, and lets a recruiter see "they can do a backend, not just write React components".

## Frontend (`/frontend`)

Single-page React app served as static assets after Vite build. Routing is client-side via React Router. Data fetching is via TanStack Query, which gives free caching, loading states and error handling.

Key conventions:

- All API calls go through `src/api/client.ts` — never `fetch` directly from components.
- Each page is a folder under `src/pages/`.
- Reusable UI lives under `src/components/`.
- Types of the API responses live under `src/types/` and are duplicated from the backend (no shared types package — small project, not worth the tooling).

The frontend talks to the backend through `/api/*`. In development, Vite proxies that path to `http://localhost:4000`. In production, the frontend reads `VITE_API_URL` from `.env` and prefixes every request with it.

## Backend (`/backend`)

REST API on Express 5. Stateless — any state lives in PostgreSQL. Layers:

1. **Routes** (`src/routes/*`) — HTTP plumbing only: parse params, call services, format responses.
2. **Services** (`src/services/*`) — pure business logic. The recommendation scoring lives here. Easy to test.
3. **DB access** — via Prisma client, instantiated once in `src/db/client.ts`.
4. **Middleware** — CORS, JSON parsing, error handling, request validation (Zod).

Inputs are validated with Zod schemas defined in `src/schemas/`. Errors flow to one central error handler that formats them consistently.

## Database (`/backend/prisma`)

PostgreSQL via Prisma. Migrations are tracked in `prisma/migrations/`. The schema lives in `prisma/schema.prisma` — that file is the single source of truth.

Four tables:

```
restaurants ──┐
              │ 1:N
              ▼
            dishes ──────┐
                         │ 1:N
                         ▼
                   platform_listings ◄────── platforms
                         (unique on dish_id + platform_id)
```

This many-to-many between dishes and platforms is the heart of the product. Without it, the comparison feature is meaningless.

## Local development flow

1. `docker compose up -d` brings up Postgres on `:5432`.
2. `npm run dev` in `/backend` starts Express on `:4000` with hot reload (tsx).
3. `npm run dev` in `/frontend` starts Vite on `:5173`.
4. The Vite proxy routes `/api/*` to the backend, so the SPA can call `fetch('/api/health')` without CORS issues.

## Production deployment

| Tier | Platform | Free tier? |
|------|----------|------------|
| Frontend | Vercel (static build) | Yes, forever |
| Backend | Render (web service) | Yes, with cold starts after 15 min idle |
| Database | Neon (serverless Postgres) | Yes, 0.5 GB |

Cold starts on Render are fine for a portfolio piece — interview-time visitors will trigger a 5-10 second first load, then it's snappy. The README explicitly notes this so it doesn't feel like a bug.

## Testing strategy

| Layer | Tool | Coverage target |
|-------|------|------------------|
| Backend route handlers | Vitest + Supertest | All routes have at least 1 happy + 1 sad path |
| Backend services (scoring) | Vitest pure unit | Edge cases of normalization formula |
| Frontend components | Vitest + RTL | Smoke tests on critical pages |
| End-to-end | (skipped for MVP) | — |

End-to-end testing (Playwright/Cypress) is intentionally out of scope. They're nice-to-have but cost more time than they return for a portfolio of this size.

## Security & secrets

- No secrets in the repo. `.env` is gitignored. `.env.example` is committed.
- Production secrets live in Vercel / Render dashboards.
- Inputs are validated with Zod, not trusted.
- The API has no authentication in the MVP (no user accounts), so there's no token storage to worry about.

## Observability

For the MVP, console logs on `console.error` are enough. Sprint 4 can optionally wire up Sentry (free tier) to surface frontend and backend errors — useful talking point in interviews.
