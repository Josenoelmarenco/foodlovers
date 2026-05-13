import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';

const stubFetch = (body: unknown) =>
  vi.fn().mockResolvedValue({
    ok: true,
    json: async () => body,
  });

function renderApp(initialEntry = '/') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('<App /> — routing', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url.includes('/api/health')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              status: 'ok',
              service: 'foodlovers-api',
              timestamp: new Date().toISOString(),
              uptimeSeconds: 1,
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            items: [],
            meta: { page: 1, pageSize: 6, total: 0, totalPages: 0 },
          }),
        });
      }),
    );
  });

  it('renders the home page hero', async () => {
    renderApp('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /find the cheapest and fastest/i,
    );
  });

  it('shows the API online badge when health succeeds', async () => {
    renderApp('/');
    await waitFor(() => {
      expect(screen.getByText(/api online/i)).toBeInTheDocument();
    });
  });

  it('renders the 404 page on unknown routes', async () => {
    renderApp('/this-route-does-not-exist');
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  // ensure stubFetch is referenced so eslint doesn't flag the helper
  it('has a usable stubFetch helper', () => {
    expect(typeof stubFetch).toBe('function');
  });
});
