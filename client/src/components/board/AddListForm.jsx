import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import Button from '../ui/Button.jsx';

export default function AddListForm({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    setBusy(true);
    const ok = await onCreate(value);
    setBusy(false);
    if (ok) { setTitle(''); setOpen(false); }
  };

  return (
    <div className="w-[286px] shrink-0">
      {open ? (
        <form onSubmit={submit} className="rounded-xl2 bg-surface p-2 shadow-card dark:bg-dpanel">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
            placeholder="List name"
            className="h-9 w-full rounded-lg border border-line px-2.5 text-[13.5px] font-semibold focus:border-accent dark:border-dline dark:bg-dpanel dark:text-dink"
          />
          <div className="mt-2 flex items-center gap-2">
            <Button type="submit" size="sm" loading={busy}>Add list</Button>
            <button type="button" onClick={() => setOpen(false)} className="p-1 text-ink-soft" aria-label="Cancel">
              <X size={18} />
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-1.5 rounded-xl2 bg-white/25 px-3 py-2.5 text-[13.5px] font-semibold text-white backdrop-blur hover:bg-white/35"
        >
          <Plus size={17} /> Add another list
        </button>
      )}
    </div>
  );
}
