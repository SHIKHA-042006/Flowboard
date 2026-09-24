import { Clock } from 'lucide-react';
import { EmptyState, ErrorState } from '../components/ui/States.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import BoardTile from '../components/board/BoardTile.jsx';
import { useDashboard } from '../hooks/useDashboard.js';

export default function RecentPage() {
  const { data, status, error, reload } = useDashboard();

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Clock size={22} className="text-accent" /> Recently viewed
        </h1>
        <p className="mt-1 text-sm text-ink-soft dark:text-dink-soft">Boards you've opened recently, newest first.</p>

        <div className="mt-6">
          {status === 'loading' && <Spinner label="Loading" />}
          {status === 'error' && <ErrorState message={error} onRetry={reload} />}
          {status === 'ready' && data.recentBoards.length === 0 && (
            <EmptyState icon={Clock} title="No recent boards yet" description="Open a board and it'll show up here." />
          )}
          {status === 'ready' && data.recentBoards.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.recentBoards.map((b) => (
                <BoardTile key={b._id} board={b} workspaceName={b.workspaceName} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
