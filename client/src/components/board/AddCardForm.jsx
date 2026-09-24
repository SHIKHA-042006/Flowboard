import { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import Button from '../ui/Button.jsx';

/** Inline composer — Enter submits and stays open so you can add several. */
export default function AddCardForm({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => { if (open) ref.current?.focus(); }, [open]);

  const submit = async (e) => {
    e?.preventDefault();
    const value = title.trim();
    if (!value) return;
    setBusy(true);
    const ok = await onCreate(value);
    setBusy(false);
    if (ok) {
      setTitle('');
      ref.current?.focus();
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-[13px] font-semibold text-ink-soft hover:bg-black/5 dark:text-dink-soft dark:hover:bg-white/10"
      >
        <Plus size={16} /> Add a card
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-lg bg-white p-2 shadow-card dark:bg-dpanel">
      <textarea
        ref={ref}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) submit(e);
          if (e.key === 'Escape') setOpen(false);
        }}
        rows={2}
        placeholder="What needs doing?"
        className="w-full resize-none border-0 bg-transparent p-1 text-[13.5px] leading-snug placeholder:text-ink-faint focus:ring-0 dark:text-dink dark:placeholder:text-dink-faint"
      />
      <div className="mt-1 flex items-center gap-2">
        <Button type="submit" size="sm" loading={busy}>Add card</Button>
        <button type="button" onClick={() => setOpen(false)} className="p-1 text-ink-soft hover:text-ink" aria-label="Cancel">
          <X size={18} />
        </button>
      </div>
    </form>
  );
}
