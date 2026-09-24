import clsx from 'clsx';
import { initials } from '../../lib/format.js';

export default function Avatar({ user, size = 28, className }) {
  if (!user) return null;
  return (
    <span
      title={`${user.name} · ${user.email}`}
      style={{ width: size, height: size, backgroundColor: user.avatarColor || '#475467', fontSize: size * 0.4 }}
      className={clsx(
        'inline-flex select-none items-center justify-center rounded-full font-bold uppercase text-white ring-2 ring-white dark:ring-dpanel',
        className
      )}
    >
      {initials(user.name)}
    </span>
  );
}

export function AvatarGroup({ users = [], max = 4, size = 28 }) {
  const shown = users.slice(0, max);
  const rest = users.length - shown.length;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((u) => (
        <Avatar key={u._id} user={u} size={size} />
      ))}
      {rest > 0 && (
        <span
          style={{ width: size, height: size, fontSize: size * 0.36 }}
          className="inline-flex items-center justify-center rounded-full bg-ink-faint font-bold text-white ring-2 ring-white dark:ring-dpanel"
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
