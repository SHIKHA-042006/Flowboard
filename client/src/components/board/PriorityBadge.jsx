import clsx from 'clsx';
import { PRIORITY_META } from '../../lib/priority.js';

export default function PriorityBadge({ priority, size = 'sm' }) {
  const meta = PRIORITY_META[priority] || PRIORITY_META.medium;
  const Icon = meta.icon;

  return (
    <span
      style={{ color: meta.color, backgroundColor: meta.bg }}
      className={clsx(
        'inline-flex items-center gap-1 rounded font-semibold',
        size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1 text-[12.5px]'
      )}
    >
      <Icon size={size === 'sm' ? 11 : 13} />
      {meta.label}
    </span>
  );
}
