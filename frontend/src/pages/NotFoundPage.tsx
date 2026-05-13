import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';

export default function NotFoundPage() {
  return (
    <EmptyState
      title="404 — Page not found"
      message="The page you tried to visit does not exist."
      action={
        <Link to="/" className="text-sm font-medium text-brand-600 hover:underline">
          ← Back to home
        </Link>
      }
    />
  );
}
