import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import SortableCard from './SortableCard.jsx';
import AddCardForm from './AddCardForm.jsx';
import Dropdown, { MenuItem } from '../ui/Dropdown.jsx';

/**
 * A column is both sortable (you can drag the column itself by its handle) and
 * a droppable zone (so cards can be dropped into an empty column).
 */
export default function ListColumn({ list, cards, labels, onOpenCard, onRename, onDelete, onCreateCard }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `list:${list._id}`,
    data: { type: 'list', listId: list._id },
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `zone:${list._id}`,
    data: { type: 'zone', listId: list._id },
  });

  const saveTitle = () => {
    const value = title.trim();
    setEditing(false);
    if (value && value !== list.title) onRename(list._id, value);
    else setTitle(list.title);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={clsx('flex min-h-0 w-[286px] shrink-0 flex-col', isDragging && 'opacity-50')}
    >
      <div className="flex min-h-0 flex-col rounded-xl2 bg-surface/95 shadow-card backdrop-blur dark:bg-dpanel/90">
        <header className="flex items-center gap-1 px-2 py-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab rounded p-1 text-ink-faint hover:bg-black/5 active:cursor-grabbing dark:text-dink-faint dark:hover:bg-white/10"
            aria-label={`Reorder ${list.title}`}
          >
            <GripVertical size={15} />
          </button>

          {editing ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTitle();
                if (e.key === 'Escape') { setTitle(list.title); setEditing(false); }
              }}
              className="h-7 flex-1 rounded border border-accent bg-white px-2 text-[13.5px] font-bold dark:bg-dpanel dark:text-dink"
            />
          ) : (
            <h3
              onClick={() => setEditing(true)}
              className="flex-1 cursor-text truncate px-1 text-[13.5px] font-bold dark:text-dink"
              title="Click to rename"
            >
              {list.title}
            </h3>
          )}

          <span className="rounded px-1.5 text-[12px] font-semibold text-ink-faint dark:text-dink-faint">{cards.length}</span>

          <Dropdown
            width="w-48"
            trigger={({ toggle }) => (
              <button onClick={toggle} className="rounded p-1 text-ink-soft hover:bg-black/5 dark:text-dink-soft dark:hover:bg-white/10" aria-label="List actions">
                <MoreHorizontal size={16} />
              </button>
            )}
          >
            {({ close }) => (
              <>
                <MenuItem icon={Pencil} onClick={() => { close(); setEditing(true); }}>Rename list</MenuItem>
                <MenuItem icon={Trash2} tone="danger" onClick={() => { close(); onDelete(list); }}>
                  Delete list
                </MenuItem>
              </>
            )}
          </Dropdown>
        </header>

        <div
          ref={setDropRef}
          className={clsx(
            'scrollbar-thin min-h-[8px] flex-1 space-y-2 overflow-y-auto px-2 pb-1',
            isOver && 'rounded-lg bg-accent/10'
          )}
        >
          <SortableContext items={cards.map((c) => c._id)} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <SortableCard key={card._id} card={card} labels={labels} onOpen={onOpenCard} />
            ))}
          </SortableContext>

          {cards.length === 0 && (
            <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-[12.5px] text-ink-faint dark:border-dline dark:text-dink-faint">
              Drop cards here
            </p>
          )}
        </div>

        <div className="p-1.5">
          <AddCardForm onCreate={(title) => onCreateCard(list._id, title)} />
        </div>
      </div>
    </div>
  );
}
