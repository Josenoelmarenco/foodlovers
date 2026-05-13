interface Props {
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, message, action }: Props) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center"
    >
      <p className="text-base font-semibold text-neutral-900">{title}</p>
      {message && <p className="mt-1 max-w-md text-sm text-neutral-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
