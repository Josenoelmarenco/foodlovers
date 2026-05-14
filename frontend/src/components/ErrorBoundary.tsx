import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level boundary so a thrown render error doesn't blank the whole app.
 * We deliberately keep this minimal: log + friendly fallback.
 * For deeper recovery you'd use a router-level errorElement or per-feature boundaries.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Replace with a real telemetry sink (Sentry, etc.) when needed.
    console.error('[FoodLovers] render error', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Something broke.</h1>
          <p className="max-w-md text-sm text-slate-600">
            The page hit an unexpected error. Reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
