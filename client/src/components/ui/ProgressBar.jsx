import clsx from 'clsx';

export default function ProgressBar({ value, total, className, tone = 'accent' }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const full = pct === 100;

  return (
    <div className={clsx('h-1.5 w-full overflow-hidden rounded-full bg-black/[.08] dark:bg-white/10', className)}>
      <div
        className={clsx('h-full rounded-full transition-all duration-300', full ? 'bg-accent' : tone === 'accent' ? 'bg-accent/70' : 'bg-ink-faint')}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
