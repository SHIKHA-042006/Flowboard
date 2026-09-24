import { useState } from 'react';
import { Link2, Paperclip, Plus, Trash2, X } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { timeAgo } from '../../lib/format.js';

export default function AttachmentsSection({ attachments = [], onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', url: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) return;
    setBusy(true);
    setError(null);
    const ok = await onAdd(form);
    setBusy(false);
    if (ok) { setForm({ name: '', url: '' }); setAdding(false); }
    else setError('Enter a valid link');
  };

  return (
    <section className="mt-6">
      <h3 className="flex items-center gap-2 px-1.5 text-sm font-bold">
        <Paperclip size={16} /> Attachments
      </h3>

      <ul className="mt-2 space-y-1.5 px-1.5">
        {attachments.map((a) => (
          <li key={a._id} className="group flex items-center gap-2.5 rounded-lg border border-line px-2.5 py-2 dark:border-dline">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-surface text-ink-soft dark:bg-white/5">
              <Link2 size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <a href={a.url} target="_blank" rel="noreferrer" className="block truncate text-[13.5px] font-semibold text-accent hover:underline">
                {a.name}
              </a>
              <p className="text-[12px] text-ink-faint dark:text-dink-faint">
                Added {timeAgo(a.createdAt)}{a.addedBy?.name ? ` by ${a.addedBy.name}` : ''}
              </p>
            </div>
            <button
              onClick={() => onDelete(a._id)}
              className="rounded p-1 text-ink-faint opacity-0 hover:bg-danger-soft hover:text-danger group-hover:opacity-100"
              aria-label="Remove attachment"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
        {!attachments.length && !adding && (
          <li className="px-1.5 text-[13px] text-ink-faint dark:text-dink-faint">No attachments yet.</li>
        )}
      </ul>

      <div className="mt-2 px-1.5">
        {adding ? (
          <form onSubmit={submit} className="space-y-2 rounded-lg border border-line p-2.5 dark:border-dline">
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Link title"
              className="h-9 w-full rounded-lg border border-line bg-white px-2.5 text-[13.5px] focus:border-accent dark:border-dline dark:bg-dpanel"
            />
            <input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://…"
              className="h-9 w-full rounded-lg border border-line bg-white px-2.5 text-[13.5px] focus:border-accent dark:border-dline dark:bg-dpanel"
            />
            {error && <p className="text-[12px] text-danger">{error}</p>}
            <div className="flex items-center gap-2">
              <Button size="sm" type="submit" loading={busy}>Attach</Button>
              <button type="button" onClick={() => setAdding(false)} className="p-1 text-ink-soft" aria-label="Cancel">
                <X size={18} />
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-ink-soft hover:bg-surface dark:text-dink-soft dark:hover:bg-white/5"
          >
            <Plus size={15} /> Attach a link
          </button>
        )}
      </div>
    </section>
  );
}
