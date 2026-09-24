import { Star } from 'lucide-react';
import { EmptyState } from '../components/ui/States.jsx';
import { ErrorState } from '../components/ui/States.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import BoardTile from '../components/board/BoardTile.jsx';
import { useDashboard } from '../hooks/useDashboard.js';

export default function StarredPage() {
  const { data, status, error, reload } = useDashboard();

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Star size={22} className="text-amber-500" /> Starred boards
        </h1>
        <p className="mt-1 text-sm text-ink-soft dark:text-dink-soft">Pin the boards you use most by starring them.</p>

        <div className="mt-6">
          {status === 'loading' && <Spinner label="Loading" />}
          {status === 'error' && <ErrorState message={error} onRetry={reload} />}
          {status === 'ready' && data.starredBoards.length === 0 && (
            <EmptyState
              icon={Star}
              title="No starred boards yet"
              description="Open a board and click the star next to its title to pin it here."
            />
          )}
          {status === 'ready' && data.starredBoards.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.starredBoards.map((b) => (
                <BoardTile key={b._id} board={b} workspaceName={b.workspaceName} starred />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
