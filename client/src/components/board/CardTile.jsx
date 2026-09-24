import { CalendarClock, MessageSquare, AlignLeft, CheckCircle2, Paperclip, CheckSquare } from 'lucide-react';
import clsx from 'clsx';
import LabelChip from './LabelChip.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import { AvatarGroup } from '../ui/Avatar.jsx';
import { dueLabel, dueTone } from '../../lib/format.js';

/** Presentational card. The sortable wrapper lives in SortableCard. */
export default function CardTile({ card, labels = [], onClick, dragging }) {
  const cardLabels = (card.labels || [])
    .map((id) => labels.find((l) => l._id === id))
    .filter(Boolean);

  const tone = card.dueDate ? dueTone(card.dueDate, card.completed) : null;
  const checklist = card.checklist || [];
  const checklistDone = checklist.filter((i) => i.done).length;

  return (
    <article
      onClick={onClick}
      className={clsx(
        'group cursor-pointer rounded-lg bg-white p-2.5 shadow-card ring-1 ring-black/[.04] transition-shadow dark:bg-dpanel dark:ring-white/[.06]',
        dragging ? 'rotate-[1.5deg] shadow-lift' : 'hover:ring-accent/40'
      )}
    >
      {cardLabels.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {cardLabels.map((l) => <LabelChip key={l._id} label={l} />)}
        </div>
      )}

      <p className={clsx('text-[13.5px] leading-snug', card.completed && 'text-ink-soft line-through dark:text-dink-soft')}>
        {card.title}
      </p>

      {card.priority && card.priority !== 'medium' && (
        <div className="mt-1.5">
          <PriorityBadge priority={card.priority} />
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[12px] text-ink-soft dark:text-dink-soft">
        {card.dueDate && (
          <span
            className={clsx(
              'inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-semibold',
              tone === 'overdue' && 'bg-danger-soft text-danger',
              tone === 'upcoming' && 'bg-surface dark:bg-white/10',
              tone === 'done' && 'bg-accent-soft text-accent dark:bg-accent/15'
            )}
          >
            {card.completed ? <CheckCircle2 size={13} /> : <CalendarClock size={13} />}
            {dueLabel(card.dueDate)}
          </span>
        )}
        {card.description && <AlignLeft size={14} aria-label="Has a description" />}
        {checklist.length > 0 && (
          <span
            className={clsx(
              'inline-flex items-center gap-1 rounded px-1 font-semibold',
              checklistDone === checklist.length && 'text-accent'
            )}
          >
            <CheckSquare size={13} /> {checklistDone}/{checklist.length}
          </span>
        )}
        {card.attachments?.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <Paperclip size={13} /> {card.attachments.length}
          </span>
        )}
        {card.comments?.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <MessageSquare size={13} /> {card.comments.length}
          </span>
        )}

        <span className="ml-auto">
          <AvatarGroup users={card.assignees || []} size={22} max={3} />
        </span>
      </div>
    </article>
  );
}
