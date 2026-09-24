import { CheckCircle2, MessageSquare, Move, Paperclip, Pencil, RotateCcw, UserPlus, Sparkles, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar.jsx';
import { timeAgo } from '../../lib/format.js';

const ICONS = {
  created: Sparkles,
  moved: Move,
  renamed: Pencil,
  commented: MessageSquare,
  completed: CheckCircle2,
  reopened: RotateCcw,
  assigned: UserPlus,
  attached: Paperclip,
  due_date_changed: CalendarClock,
};

/** Renders one activity/history entry. `showCard` also prints which card it was on (dashboard/workspace feeds). */
function describe(entry) {
  switch (entry.type) {
    case 'created': return `created this card${entry.meta?.listTitle ? ` in ${entry.meta.listTitle}` : ''}`;
    case 'moved': return `moved this card from ${entry.meta?.from || '—'} to ${entry.meta?.to || '—'}`;
    case 'renamed': return 'renamed this card';
    case 'commented': return 'commented';
    case 'completed': return 'marked this card complete';
    case 'reopened': return 'reopened this card';
    case 'assigned': return 'changed the assignees';
    case 'attached': return `attached "${entry.meta?.name || 'a file'}"`;
    case 'due_date_changed': return entry.meta?.dueDate ? 'set a due date' : 'removed the due date';
    default: return 'updated this card';
  }
}

export default function ActivityFeedItem({ entry, showCard = false }) {
  const Icon = ICONS[entry.type] || Sparkles;
  const navigate = useNavigate();

  return (
    <li className="flex gap-2.5">
      <Avatar user={entry.actor} size={28} />
      <div className="min-w-0 flex-1 pb-3">
        <p className="text-[13px] leading-snug">
          <span className="font-semibold">{entry.actor?.name || 'Someone'}</span>{' '}
          <span className="text-ink-soft dark:text-dink-soft">{describe(entry)}</span>
          {showCard && entry.cardTitle && (
            <>
              {' '}on{' '}
              <button onClick={() => navigate(`/boards/${entry.boardId}`)} className="font-semibold text-accent hover:underline">
                {entry.cardTitle}
              </button>
            </>
          )}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-faint dark:text-dink-faint">
          <Icon size={12} /> {timeAgo(entry.createdAt)}
        </p>
      </div>
    </li>
  );
}
