import { CalendarClock } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import PriorityBadge from '../board/PriorityBadge.jsx';
import { AvatarGroup } from '../ui/Avatar.jsx';
import { dueLabel, dueTone } from '../../lib/format.js';

export default function TaskRow({ card }) {
  const navigate = useNavigate();
  const tone = card.dueDate ? dueTone(card.dueDate, card.completed) : null;

  return (
    <button
      onClick={() => navigate(`/boards/${card.board}`)}
      className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left hover:bg-surface dark:hover:bg-white/5"
    >
      <PriorityBadge priority={card.priority} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-semibold">{card.title}</span>
        <span className="block truncate text-[12px] text-ink-faint dark:text-dink-faint">{card.boardTitle}</span>
      </span>
      {card.dueDate && (
        <span
          className={clsx(
            'flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[11.5px] font-semibold',
            tone === 'overdue' && 'bg-danger-soft text-danger',
            tone === 'upcoming' && 'bg-surface text-ink-soft dark:bg-white/10 dark:text-dink-soft'
          )}
        >
          <CalendarClock size={12} /> {dueLabel(card.dueDate)}
        </span>
      )}
      <AvatarGroup users={card.assignees || []} size={22} max={2} />
    </button>
  );
}
