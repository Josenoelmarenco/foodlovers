# Project plan — FoodLovers

> Master planning document. Read it once before each sprint.

## 1. Executive summary

FoodLovers is a portfolio-grade full-stack web app that compares the same dish across multiple delivery platforms. It demonstrates real engineering: schema design, REST API, modern React UI, transparent ranking logic, automated tests, CI/CD, and a deployed product.

All listings data is **synthetic mock data** generated to showcase the system — real platforms (Uber Eats, Wolt, Foodora) do not expose public APIs, and scraping them would be both fragile and a terms-of-service violation. The honesty around this is itself a signal of engineering judgment.

## 2. Scope of the MVP

**In scope (4 sprints):**

1. Search and filter dishes by name, cuisine, neighborhood, price.
2. Side-by-side comparison of the same dish across all platforms that list it.
3. Recommendation engine: user picks priorities (price / time / rating), system returns top 3 with explanation.
4. Restaurant detail pages.

**Out of scope (post-MVP):**

- User accounts and authentication
- Real checkout or payments
- Server-side favorites or history
- Admin dashboard
- Real-time map of delivery vehicles

## 3. Architecture

Three-tier classic architecture:

```
Frontend (React)  ←HTTP/JSON→  Backend (Express)  ←Prisma→  PostgreSQL
   Vercel                         Render                       Neon
```

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full breakdown.

## 4. Tech stack — short version

| Layer | Tools |
|-------|-------|
| Frontend | React 18, Vite, TypeScript (strict), TailwindCSS, React Router, TanStack Query |
| Backend | Node 20, Express 5, TypeScript (strict), Prisma, Zod |
| Database | PostgreSQL 16 (Docker locally, Neon in prod) |
| Tests | Vitest, Supertest, React Testing Library |
| Quality | ESLint, Prettier, EditorConfig, Husky |
| CI/CD | GitHub Actions |
| Deploy | Vercel (web), Render (api), Neon (db) |

## 5. Schema overview

Four tables, all relational and normalized:

- `restaurants` — restaurant brand/identity
- `dishes` — individual dishes, each belongs to a restaurant
- `platforms` — delivery platforms (label-only, no logos)
- `platform_listings` — the join: same dish across platforms with price, fee, delivery time

The clever bit is `platform_listings`. It's where the actual product value lives — a dish in platform A vs platform B is essentially "the same dish, different listings". The recommendation engine ranks across listings.

## 6. Recommendation logic

Deterministic, explainable, no LLM:

```
score =
    weights.price  × (1 − normalize(totalPrice,  minTP, maxTP))
  + weights.time   × (1 − normalize(deliveryMin, minDM, maxDM))
  + weights.rating ×      normalize(rating,      0,     5)
```

Where `weights` come from the user's sliders. The API responds with the top N listings + a human-readable reason ("Best balance of price (€14.90) and 25 min delivery for your priorities.").

## 7. Sprint roadmap

| Sprint | Length | Focus | Status |
|--------|--------|-------|--------|
| 0 | 1 week | Scaffolding, CI, hello-world end-to-end | ✅ done |
| 1 | 1 week | Schema, seed, REST endpoints | 🚧 next |
| 2 | 1 week | Frontend search, listings, restaurant detail | ⏳ |
| 3 | 1 week | Comparison view + recommendation engine | ⏳ |
| 4 | (rolling) | Polish, accessibility, deploy, README final | ⏳ |

## 8. Quality bar

Targets for the final repo:

- [ ] CI green on every push (badge in README)
- [ ] No `any` in TypeScript without justification
- [ ] >40% backend test coverage, >25% frontend
- [ ] Lighthouse accessibility score ≥ 90
- [ ] Conventional Commits throughout
- [ ] Live, public deploy linked from README
- [ ] One-paragraph "About me" section in README
- [ ] Screenshots in README

## 9. Open questions tracker

Use this section to record decisions made later. Examples:

- _Authentication_: postponed — not in MVP.
- _Pagination_: cursor-based vs offset? → decide in Sprint 1.
- _Image hosting_: use placeholder URLs (Unsplash collections) for mock data.

## 10. References

- Sprint plan: this document
- Architecture: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- Local setup: [`SETUP.md`](SETUP.md)
- Deploy: [`DEPLOY.md`](DEPLOY.md)
