# FoodLovers

> A side-by-side delivery comparison app. Search a dish, see which platform delivers it cheaper and faster, get a smart recommendation tailored to your priorities.

[![CI](https://github.com/Josenoelmarenco/foodlovers/actions/workflows/ci.yml/badge.svg)](https://github.com/Josenoelmarenco/foodlovers/actions)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Node%20%2B%20PostgreSQL-blue)
![TypeScript](https://img.shields.io/badge/typescript-strict-3178c6)
![License](https://img.shields.io/badge/license-MIT-green)

## What is this

**FoodLovers** is a portfolio-grade full-stack web application that helps people decide where to order food. It pulls (mocked) listings of the same dish from multiple delivery platforms and shows the user, in one screen, which platform is cheapest, fastest, or best balanced for their priorities. A built-in recommendation engine scores results using a transparent formula — no LLM, no black box.

> **Honesty note:** Uber Eats, Wolt and Foodora do not expose public APIs. All data in this project is **synthetic mock data** generated specifically to demonstrate the architecture. The point of the app is to showcase engineering — schema design, API design, UI patterns, deployment — not real delivery aggregation.

## Live demo

🚧 Coming soon. The deploy will live here:

- Web: `https://foodlovers.vercel.app` _(once deployed)_
- API: `https://foodlovers-api.onrender.com` _(once deployed)_

## Tech stack

| Layer | Tooling |
|-------|---------|
| Frontend | React 18, Vite, TypeScript, TailwindCSS, React Router, TanStack Query |
| Backend | Node.js 20, Express 5, TypeScript, Prisma, Zod |
| Database | PostgreSQL 16 |
| Tests | Vitest, Supertest, React Testing Library |
| Quality | ESLint, Prettier, EditorConfig, Husky, Conventional Commits |
| CI/CD | GitHub Actions |
| Deploy | Vercel (web) · Render (api) · Neon (db) |

## Repository layout

```
foodlovers/
├── frontend/    # React app (Vite)
├── backend/     # Express API (Node + Prisma)
├── docs/        # Architecture, setup and deploy guides
├── .github/     # CI workflows
└── docker-compose.yml   # Local Postgres
```

## Quick start

Full instructions are in [`docs/SETUP.md`](docs/SETUP.md). TL;DR for macOS Apple Silicon:

```bash
# 1. Start local Postgres
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
npm install
npm run prisma:migrate
npm run seed
npm run dev          # http://localhost:4000

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev          # http://localhost:5173
```

Open http://localhost:5173 and you should see a green health-check pill confirming the API is reachable.

## Documentation

- [`docs/PLAN.md`](docs/PLAN.md) — Project plan and design decisions
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — System architecture and data flow
- [`docs/SETUP.md`](docs/SETUP.md) — Local development setup
- [`docs/DEPLOY.md`](docs/DEPLOY.md) — Production deployment guide

## Roadmap

This project is built in 5 sprints over ~4 weeks. Track progress in the [Issues](https://github.com/Josenoelmarenco/foodlovers/issues) tab once it's pushed.

- [x] **Sprint 0** — Scaffolding, CI, health-check hello world
- [ ] **Sprint 1** — Database schema, mock data, REST endpoints
- [ ] **Sprint 2** — Frontend search, listings and restaurant detail
- [ ] **Sprint 3** — Comparison view and recommendation engine
- [ ] **Sprint 4** — Polish, accessibility, deploy

## About the author

**José Noel Marenco** — Software Engineering student at Metropolia University of Applied Sciences (Helsinki, Finland), building toward full-stack and product engineering roles.

- GitHub: [@Josenoelmarenco](https://github.com/Josenoelmarenco)
- Email: jnmarenco.ni@gmail.com

## License

[MIT](LICENSE)
