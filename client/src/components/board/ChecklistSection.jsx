import { useState } from 'react';
import { CheckSquare, Plus, Trash2, X } from 'lucide-react';
import clsx from 'clsx';
import Button from '../ui/Button.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';

export default function ChecklistSection({ checklist = [], onAdd, onToggle, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const done = checklist.filter((i) => i.done).length;

  const submit = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setBusy(true);
    await onAdd(value);
    setBusy(false);
    setText('');
  };

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between px-1.5">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <CheckSquare size={16} /> Checklist
        </h3>
        {checklist.length > 0 && (
          <span className="text-[12px] font-semibold text-ink-soft dark:text-dink-soft">
            {done}/{checklist.length}
          </span>
        )}
      </div>

      {checklist.length > 0 && (
        <div className="mt-2 px-1.5">
          <ProgressBar value={done} total={checklist.length} />
        </div>
      )}

      <ul className="mt-3 space-y-1 px-1.5">
        {checklist.map((item) => (
          <li key={item._id} className="group flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-surface dark:hover:bg-white/5">
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => onToggle(item._id)}
              className="h-4 w-4 shrink-0 rounded border-line text-accent"
            />
            <span className={clsx('flex-1 text-[13.5px]', item.done && 'text-ink-faint line-through')}>
              {item.text}
            </span>
            <button
              onClick={() => onDelete(item._id)}
              className="rounded p-1 text-ink-faint opacity-0 hover:bg-danger-soft hover:text-danger group-hover:opacity-100"
              aria-label="Delete checklist item"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-2 px-1.5">
        {adding ? (
          <form onSubmit={submit} className="flex items-center gap-2">
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setAdding(false)}
              placeholder="Add an item"
              className="h-9 flex-1 rounded-lg border border-line bg-white px-2.5 text-[13.5px] focus:border-accent dark:border-dline dark:bg-dpanel"
            />
            <Button size="sm" type="submit" loading={busy}>Add</Button>
            <button type="button" onClick={() => setAdding(false)} className="p-1 text-ink-soft" aria-label="Cancel">
              <X size={18} />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-ink-soft hover:bg-surface dark:text-dink-soft dark:hover:bg-white/5"
          >
            <Plus size={15} /> Add an item
          </button>
        )}
      </div>
    </section>
  );
}
