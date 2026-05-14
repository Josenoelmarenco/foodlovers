# FoodLovers

> A side-by-side delivery comparison app. Search a dish, see which platform delivers it cheaper and faster, then let a transparent recommendation engine pick the best option for *your* priorities.

[![CI](https://github.com/Josenoelmarenco/foodlovers/actions/workflows/ci.yml/badge.svg)](https://github.com/Josenoelmarenco/foodlovers/actions)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Node%20%2B%20PostgreSQL-blue)
![TypeScript](https://img.shields.io/badge/typescript-strict-3178c6)
![Tests](https://img.shields.io/badge/tests-vitest-yellow)
![License](https://img.shields.io/badge/license-MIT-green)

## What is this

**FoodLovers** is a full-stack web application that helps a user decide *where* to order food. It pulls listings of the same dish from multiple delivery platforms and shows, in one screen, which is cheapest, which is fastest, and which is the best balanced choice based on weights the user controls. The recommendation engine is fully deterministic — every score can be recomputed by hand from the inputs, which makes the feature explainable and testable.

It was built as a portfolio project to demonstrate:

- Clean separation between **frontend** (React + Vite + TS) and **backend** (Express + Prisma + TS) in a single monorepo.
- A real **schema-first** approach using Prisma migrations + Zod validation at the API boundary.
- **Transparent business logic** (no LLM in the recommendation path) backed by unit tests.
- **Production-shaped** ops: CI on every PR, type-safe everywhere, deployable to free-tier infrastructure (Vercel + Render + Neon).

> **Honest note about the data.** Uber Eats, Wolt and Foodora do not expose public APIs that a personal project can consume. All restaurants, dishes and price listings in this project are **synthetic mock data**, seeded into Postgres by `backend/src/db/seed.ts`. The goal is to demonstrate engineering — schema design, API design, UI patterns, scoring math, deployment — not real delivery aggregation.

## Live demo

- Web: `https://foodlovers.vercel.app` *(see `docs/DEPLOY.md` to reproduce)*
- API: `https://foodlovers-api.onrender.com`

## Screenshots

> _Run `npm run dev` in both `frontend/` and `backend/` to see the actual UI. Screenshots placeholders live in `docs/screenshots/`._

| Home | Search | Dish detail (assistant) |
|---|---|---|
| `docs/screenshots/home.png` | `docs/screenshots/search.png` | `docs/screenshots/dish-detail.png` |

## The recommendation engine in one paragraph

For each available platform listing of the requested dish, the engine computes three normalized scores in `0..1`:

- **Price**: how the platform's *total cost* (item price + delivery fee) compares to the others. Cheapest = 1, most expensive = 0.
- **Speed**: how the platform's ETA compares. Fastest = 1, slowest = 0.
- **Quality**: the restaurant rating, mapped from `0..5` to `0..1` (currently shared across all listings for a dish — same restaurant, same rating).

The final score is `price·w_p + speed·w_s + quality·w_q`, where the three weights are user-controlled sliders that always sum to 1.0. The top-scoring listing wins. The full math lives in `backend/src/services/recommendation.ts` and is covered by unit tests in `backend/tests/recommendation.test.ts`.

## Tech stack

| Layer | Tooling |
|---|---|
| Frontend | React 18, Vite 5, TypeScript (strict), Tailwind 3, React Router 6, TanStack Query 5 |
| Backend | Node 20, Express 5, TypeScript (strict), Prisma ORM, Zod |
| Database | PostgreSQL 16 (local via Docker, prod via Neon) |
| Tests | Vitest, Supertest, React Testing Library, `@testing-library/user-event` |
| Quality | ESLint flat config, Prettier, EditorConfig, Conventional Commits |
| CI / CD | GitHub Actions (lint + typecheck + tests on every PR) |
| Deploy | Vercel (web) · Render (api) · Neon (db) — all free tier |

## Repository layout

```
foodlovers/
├── frontend/                # React app (Vite)
│   ├── src/
│   │   ├── api/             # typed fetch client + TanStack Query hooks
│   │   ├── components/      # presentational + small smart components
│   │   ├── pages/           # route-level components
│   │   ├── lib/             # formatters, helpers (no I/O)
│   │   └── types/           # API DTOs mirrored from backend
│   ├── tests/               # Vitest + React Testing Library
│   └── vercel.json          # SPA rewrites
├── backend/                 # Express API (Node + Prisma)
│   ├── prisma/              # schema.prisma + migrations
│   ├── src/
│   │   ├── routes/          # thin HTTP handlers
│   │   ├── services/        # pure-ish business logic (incl. scoring)
│   │   ├── schemas/         # Zod request validators
│   │   ├── lib/             # env, http errors, prisma client
│   │   ├── middleware/      # error handler
│   │   └── db/seed.ts       # idempotent mock-data seed
│   └── tests/               # Vitest + Supertest (Prisma mocked)
├── docs/                    # Architecture, setup, deploy
├── .github/workflows/ci.yml # CI: backend + frontend in parallel
└── docker-compose.yml       # Local Postgres
```

## Quick start (macOS Apple Silicon)

```bash
# 0. Use Node 20 (nvm recommended)
nvm install 20 && nvm use 20

# 1. Start local Postgres
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
npm install
npm run prisma:migrate     # apply schema
npm run seed               # populate mock data
npm run dev                # http://localhost:4000/api/health

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

Open <http://localhost:5173>. You should see a green “API online” pill in the header.

Full step-by-step instructions for a clean machine live in [`docs/SETUP.md`](docs/SETUP.md).

## Useful commands

From either `frontend/` or `backend/`:

| Command | What it does |
|---|---|
| `npm run dev` | start the dev server with HMR / nodemon |
| `npm run build` | typecheck + production bundle |
| `npm run lint` | ESLint, treat warnings as errors |
| `npm run format` | Prettier write |
| `npm test` | Vitest run |
| `npm run prisma:migrate` *(backend)* | apply migrations against `DATABASE_URL` |
| `npm run seed` *(backend)* | wipe + reseed mock data |

## API surface

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | liveness probe (used by frontend badge) |
| GET | `/api/platforms` | list of platforms with brand colors |
| GET | `/api/restaurants` | paginated restaurants, filterable by `cuisine` / `neighborhood` |
| GET | `/api/restaurants/:id` | single restaurant with its dishes + listings |
| GET | `/api/dishes/search` | paginated dish search by `q`, `cuisine`, `neighborhood`, `maxPrice`, `platformId` |
| GET | `/api/dishes/:id` | single dish with its listings across platforms |
| POST | `/api/recommendations` | scored ranking of platforms for `dishId` given `weights` |

All inputs are validated with Zod. Errors are returned as `{ error, message }` JSON with a meaningful status code.

## Documentation

- [`docs/PLAN.md`](docs/PLAN.md) — Project plan, sprint roadmap, design decisions
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — System architecture and data flow
- [`docs/SETUP.md`](docs/SETUP.md) — Local development setup, including macOS gotchas
- [`docs/DEPLOY.md`](docs/DEPLOY.md) — Production deploy to Vercel + Render + Neon (free tier)

## Roadmap

- [x] **Sprint 0** — Scaffolding, CI, health-check hello world
- [x] **Sprint 1** — Database schema, mock data seed, REST endpoints
- [x] **Sprint 2** — Frontend search, listings and restaurant detail
- [x] **Sprint 3** — Comparison view and recommendation engine
- [x] **Sprint 4** — Polish, accessibility, production deploy

## Engineering decisions worth calling out

A few of the trade-offs taken on purpose, not by accident:

- **No LLM in the recommendation path.** A deterministic weighted-sum is faster, free, easier to unit-test and easier to explain to a recruiter than “we ask GPT.” The explanation string is templated from the inputs.
- **Prisma is mocked in unit tests via `vi.hoisted()`** so the API tests don't need a running database. The real database is exercised in CI via a Postgres service container.
- **Filters live in the URL** (`useSearchParams`) so search state survives refresh and can be shared as a link.
- **Strict TS everywhere**, including `noUncheckedIndexedAccess`, to force handling of `undefined` from arrays.
- **CI fails on lint warnings**, not just errors, to keep the codebase tidy.

## About the author

**José Noel Marenco** — Software Engineering student at Metropolia University of Applied Sciences (Helsinki, Finland). Interested in full-stack web, mobile, IoT and product engineering.

- GitHub: [@Josenoelmarenco](https://github.com/Josenoelmarenco)
- Email: jnmarenco.ni@gmail.com

## License

[MIT](LICENSE)
