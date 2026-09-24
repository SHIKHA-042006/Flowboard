import { useCallback, useEffect, useState } from 'react';
import { ListChecks } from 'lucide-react';
import api, { errorMessage } from '../lib/api.js';
import Spinner from '../components/ui/Spinner.jsx';
import { EmptyState, ErrorState } from '../components/ui/States.jsx';
import TaskRow from '../components/dashboard/TaskRow.jsx';

const FILTERS = [
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'all', label: 'All' },
];

export default function MyTasksPage() {
  const [cards, setCards] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('active');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const { data } = await api.get('/dashboard/my-tasks');
      setCards(data.cards);
      setStatus('ready');
    } catch (err) {
      setError(errorMessage(err));
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (status === 'loading') return <div className="grid h-full place-items-center"><Spinner label="Loading your tasks" /></div>;
  if (status === 'error') return <div className="p-8"><ErrorState message={error} onRetry={load} /></div>;

  const filtered = cards.filter((c) => {
    if (filter === 'active') return !c.completed;
    if (filter === 'completed') return c.completed;
    return true;
  });

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
        <p className="mt-1 text-sm text-ink-soft dark:text-dink-soft">Every card assigned to you, across every board.</p>

        <div className="mt-5 flex gap-1 rounded-lg bg-surface p-1 dark:bg-white/5" style={{ width: 'fit-content' }}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                filter === f.id ? 'bg-white text-accent shadow-card dark:bg-dpanel' : 'text-ink-soft dark:text-dink-soft'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl2 border border-line bg-panel p-1.5 shadow-card dark:border-dline dark:bg-dpanel">
          {filtered.length === 0 ? (
            <EmptyState icon={ListChecks} title="Nothing here" description="Cards assigned to you will show up in this list." />
          ) : (
            filtered.map((c) => <TaskRow key={c._id} card={c} />)
          )}
        </div>
      </div>
    </div>
  );
}
