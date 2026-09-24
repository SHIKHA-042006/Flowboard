import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Loader2, Search, SquareKanban, X } from 'lucide-react';
import api from '../../lib/api.js';

/**
 * Debounced search-as-you-type across boards and cards. Opening a card result
 * routes to its board — this app has no standalone card URL — and scrolls
 * there; opening it is left to the board page itself once loaded.
 */
export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState({ boards: [], cards: [] });
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (q.trim().length < 2) { setResults({ boards: [], cards: [] }); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/search', { params: { q } });
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 260);
    return () => clearTimeout(timer);
  }, [q]);

  const go = (boardId) => {
    setOpen(false);
    setQ('');
    navigate(`/boards/${boardId}`);
  };

  const hasResults = results.boards.length > 0 || results.cards.length > 0;

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
      <input
        value={q}
        onFocus={() => setOpen(true)}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search boards and cards…"
        aria-label="Search boards and cards"
        className="h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-8 text-[13.5px] placeholder:text-ink-faint focus:border-accent focus:bg-white dark:border-dline dark:bg-white/5 dark:text-dink dark:placeholder:text-dink-faint dark:focus:bg-dpanel"
      />
      {q && (
        <button
          onClick={() => { setQ(''); setResults({ boards: [], cards: [] }); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}

      {open && q.trim().length >= 2 && (
        <div className="fade-in absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-xl2 border border-line bg-panel p-2 shadow-lift dark:border-dline dark:bg-dpanel">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-4 text-[13px] text-ink-soft dark:text-dink-soft">
              <Loader2 size={14} className="animate-spin" /> Searching…
            </div>
          )}

          {!loading && !hasResults && (
            <p className="px-3 py-4 text-[13px] text-ink-soft dark:text-dink-soft">No matches for "{q}"</p>
          )}

          {!loading && results.boards.length > 0 && (
            <div className="mb-1">
              <p className="px-2.5 pb-1 pt-1 text-[11px] font-bold uppercase tracking-wide text-ink-faint dark:text-dink-faint">Boards</p>
              {results.boards.map((b) => (
                <button
                  key={b._id}
                  onClick={() => go(b._id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-surface dark:hover:bg-white/5"
                >
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded bg-board-${b.background} text-white`}>
                    <SquareKanban size={13} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold">{b.title}</span>
                    <span className="block truncate text-[12px] text-ink-faint dark:text-dink-faint">{b.workspaceName}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {!loading && results.cards.length > 0 && (
            <div>
              <p className="px-2.5 pb-1 pt-1 text-[11px] font-bold uppercase tracking-wide text-ink-faint dark:text-dink-faint">Cards</p>
              {results.cards.map((c) => (
                <button
                  key={c._id}
                  onClick={() => go(c.board)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-surface dark:hover:bg-white/5"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-surface text-ink-soft dark:bg-white/10">
                    <LayoutGrid size={13} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold">{c.title}</span>
                    <span className="block truncate text-[12px] text-ink-faint dark:text-dink-faint">{c.boardTitle}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
