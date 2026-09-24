import { AlertTriangle, Inbox } from 'lucide-react';
import Button from './Button.jsx';

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-line bg-white/60 px-6 py-12 text-center">
      <Icon size={28} className="text-ink-faint dark:text-dink-faint" aria-hidden />
      <h3 className="mt-3 text-base font-bold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-soft dark:text-dink-soft">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl2 border border-danger/30 bg-danger-soft px-6 py-10 text-center"
    >
      <AlertTriangle size={26} className="text-danger" aria-hidden />
      <h3 className="mt-3 text-base font-bold text-ink">That did not load</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-soft">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
