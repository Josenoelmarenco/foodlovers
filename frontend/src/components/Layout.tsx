import { Link, Outlet, useNavigate } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { HealthBadge } from './HealthBadge';

export function Layout() {
  const navigate = useNavigate();
  const onSearch = (q: string) => {
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
          <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="FoodLovers home">
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 font-bold text-white"
            >
              F
            </span>
            <span className="text-lg font-semibold tracking-tight">FoodLovers</span>
          </Link>
          <div className="hidden flex-1 md:block">
            <SearchBar size="sm" placeholder="Search a dish…" onSubmit={onSearch} />
          </div>
          <HealthBadge />
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-6 py-6 text-sm text-neutral-500 md:flex-row md:justify-between">
          <span>© 2026 José Noel Marenco</span>
          <span>
            <a
              className="underline-offset-2 hover:underline"
              href="https://github.com/Josenoelmarenco/foodlovers"
            >
              View source on GitHub
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
