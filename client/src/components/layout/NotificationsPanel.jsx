import { Bell, CheckCheck, MessageSquare, UserPlus, Users, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import Dropdown from '../ui/Dropdown.jsx';
import Avatar from '../ui/Avatar.jsx';
import { timeAgo } from '../../lib/format.js';
import { useNotifications } from '../../hooks/useNotifications.js';

const ICONS = {
  card_assigned: UserPlus,
  card_due_soon: CalendarClock,
  card_comment: MessageSquare,
  card_mentioned: MessageSquare,
  board_invite: Users,
  workspace_invite: Users,
};

export default function NotificationsPanel() {
  const { notifications, unreadCount, status, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <Dropdown
      width="w-80"
      trigger={({ toggle }) => (
        <button
          onClick={toggle}
          className="relative rounded-lg p-2 text-ink-soft hover:bg-surface dark:text-dink-soft dark:hover:bg-white/10"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}
    >
      {() => (
        <div>
          <div className="flex items-center justify-between px-1.5 pb-2">
            <p className="text-sm font-bold">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-[12px] font-semibold text-accent hover:underline">
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          <div className="scrollbar-thin max-h-96 overflow-y-auto">
            {status === 'loading' && (
              <p className="px-2 py-6 text-center text-[13px] text-ink-soft dark:text-dink-soft">Loading…</p>
            )}

            {status === 'ready' && notifications.length === 0 && (
              <p className="px-2 py-6 text-center text-[13px] text-ink-soft dark:text-dink-soft">You're all caught up.</p>
            )}

            {notifications.map((n) => {
              const Icon = ICONS[n.type] || Bell;
              return (
                <button
                  key={n._id}
                  onClick={() => {
                    markRead(n._id);
                    if (n.board) navigate(`/boards/${n.board}`);
                  }}
                  className={clsx(
                    'flex w-full items-start gap-2.5 rounded-lg px-2 py-2.5 text-left hover:bg-surface dark:hover:bg-white/5',
                    !n.read && 'bg-accent-soft/60 dark:bg-accent/10'
                  )}
                >
                  {n.actor ? <Avatar user={n.actor} size={30} /> : (
                    <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-surface text-ink-soft dark:bg-white/10">
                      <Icon size={14} />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] leading-snug">{n.message}</span>
                    <span className="mt-0.5 block text-[11.5px] text-ink-faint dark:text-dink-faint">{timeAgo(n.createdAt)}</span>
                  </span>
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Dropdown>
  );
}
