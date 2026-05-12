import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../src/App';

function renderWithQuery(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('<App />', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the hero headline', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'ok',
          service: 'foodlovers-api',
          timestamp: new Date().toISOString(),
          uptimeSeconds: 1,
        }),
      }),
    );

    renderWithQuery(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /compare the same dish/i,
    );
  });

  it('shows the API online badge when health succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'ok',
          service: 'foodlovers-api',
          timestamp: new Date().toISOString(),
          uptimeSeconds: 1,
        }),
      }),
    );

    renderWithQuery(<App />);

    await waitFor(() => {
      expect(screen.getByText(/api online/i)).toBeInTheDocument();
    });
  });
});
