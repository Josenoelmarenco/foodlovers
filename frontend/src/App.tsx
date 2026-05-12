import { HealthBadge } from './components/HealthBadge';

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2">
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 font-bold text-white"
            >
              F
            </span>
            <span className="text-lg font-semibold tracking-tight">FoodLovers</span>
          </a>
          <HealthBadge />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <section className="text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand-600">
            Sprint 0 · scaffolding
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Compare the same dish across delivery platforms.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
            FoodLovers brings price, delivery fee and ETA into one screen, then recommends the best
            option for your priorities. Search, compare and decide in seconds.
          </p>

          <div className="mt-10 inline-flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
            <span className="text-sm text-neutral-500">Status</span>
            <span className="text-sm font-medium text-neutral-900">
              Frontend ↔ backend wiring is live. Sprint 1 lands the real data.
            </span>
          </div>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3" aria-label="Roadmap preview">
          <RoadmapCard sprint="Sprint 1" title="Backend + data" body="Schema, mock data, REST endpoints." />
          <RoadmapCard sprint="Sprint 2" title="Search & detail" body="Browse restaurants and dishes." />
          <RoadmapCard sprint="Sprint 3" title="Recommendation engine" body="Score and explain the best option." />
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-1 px-6 py-6 text-sm text-neutral-500 md:flex-row md:justify-between">
          <span>© 2026 José Noel Marenco</span>
          <span>
            Built with React · Express · PostgreSQL ·{' '}
            <a
              className="underline-offset-2 hover:underline"
              href="https://github.com/Josenoelmarenco/foodlovers"
            >
              source
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

function RoadmapCard({ sprint, title, body }: { sprint: string; title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{sprint}</p>
      <h2 className="mt-2 text-lg font-semibold text-neutral-900">{title}</h2>
      <p className="mt-2 text-sm text-neutral-600">{body}</p>
    </article>
  );
}
