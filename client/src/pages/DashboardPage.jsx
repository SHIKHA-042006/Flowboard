import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Clock, ListChecks, Plus, SquareKanban, Star, TrendingUp,
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import { DashboardSkeleton } from '../components/ui/Skeleton.jsx';
import { ErrorState } from '../components/ui/States.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import BoardRow from '../components/dashboard/BoardRow.jsx';
import TaskRow from '../components/dashboard/TaskRow.jsx';
import ActivityFeedItem from '../components/board/ActivityFeedItem.jsx';
import CreateBoardModal from '../components/board/CreateBoardModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDashboard } from '../hooks/useDashboard.js';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { workspaces, reloadWorkspaces } = useOutletContext();
  const { data, status, error, reload } = useDashboard();
  const [creating, setCreating] = useState(false);

  const refreshAll = () => { reload(); reloadWorkspaces(); };

  if (status === 'loading') return <div className="scrollbar-thin h-full overflow-y-auto"><DashboardSkeleton /></div>;
  if (status === 'error') return <div className="p-8"><ErrorState message={error} onRetry={reload} /></div>;

  const { stats, starredBoards, recentBoards, assignedCards, upcoming, activity } = data;

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-accent via-[#0B6153] to-[#123B33] px-6 py-7 text-white shadow-lift sm:px-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute bottom-0 right-24 h-24 w-24 rounded-full bg-white/10" />
          <p className="relative text-sm font-semibold text-white/80">{greeting()}</p>
          <h1 className="relative mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{user?.name.split(' ')[0]}, here's your day</h1>
          <p className="relative mt-2 max-w-lg text-[13.5px] text-white/85">
            {stats.assigned > 0
              ? `You have ${stats.assigned} task${stats.assigned === 1 ? '' : 's'} assigned across ${stats.boards} boards.`
              : "You're all caught up — nothing assigned to you right now."}
          </p>
          <div className="relative mt-5 flex flex-wrap gap-2">
            <Button variant="secondary" className="bg-white/95" onClick={() => setCreating(true)}>
              <Plus size={16} /> New board
            </Button>
            <Link to="/templates">
              <Button variant="ghost" className="text-white hover:bg-white/15">Browse templates</Button>
            </Link>
          </div>
        </div>

        {/* Stat row */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Briefcase} label="Workspaces" value={stats.workspaces} tone="accent" />
          <StatCard icon={SquareKanban} label="Active boards" value={stats.boards} tone="slate" />
          <StatCard icon={ListChecks} label="Assigned to you" value={stats.assigned} tone="amber" />
          <StatCard icon={Star} label="Starred boards" value={starredBoards.length} tone="rose" />
        </div>

        <BoardRow
          title="Starred boards"
          icon={Star}
          boards={starredBoards.map((b) => ({ ...b, starred: true }))}
          emptyLabel="Star a board to pin it here"
        />

        <BoardRow
          title="Recently viewed"
          icon={Clock}
          boards={recentBoards}
          emptyLabel="Open a board and it'll show up here"
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 flex items-center gap-1.5 text-[13px] font-bold text-ink-faint dark:text-dink-faint">
              <ListChecks size={14} /> Assigned to you
            </h2>
            <div className="rounded-xl2 border border-line bg-panel p-1.5 shadow-card dark:border-dline dark:bg-dpanel">
              {assignedCards.length === 0 ? (
                <p className="px-3 py-6 text-center text-[13px] text-ink-soft dark:text-dink-soft">Nothing assigned to you yet.</p>
              ) : (
                assignedCards.map((c) => <TaskRow key={c._id} card={c} />)
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-1.5 text-[13px] font-bold text-ink-faint dark:text-dink-faint">
              <TrendingUp size={14} /> Upcoming deadlines
            </h2>
            <div className="rounded-xl2 border border-line bg-panel p-1.5 shadow-card dark:border-dline dark:bg-dpanel">
              {upcoming.length === 0 ? (
                <p className="px-3 py-6 text-center text-[13px] text-ink-soft dark:text-dink-soft">No due dates coming up.</p>
              ) : (
                upcoming.map((c) => <TaskRow key={c._id} card={c} />)
              )}
            </div>
          </section>
        </div>

        <section className="mt-8 pb-10">
          <h2 className="mb-3 text-[13px] font-bold text-ink-faint dark:text-dink-faint">Activity across your boards</h2>
          <div className="rounded-xl2 border border-line bg-panel p-4 shadow-card dark:border-dline dark:bg-dpanel">
            {activity.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-ink-soft dark:text-dink-soft">No recent activity.</p>
            ) : (
              <ul>
                {activity.map((entry) => (
                  <ActivityFeedItem key={`${entry.cardId}-${entry._id}`} entry={entry} showCard />
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <CreateBoardModal open={creating} onClose={() => setCreating(false)} workspaces={workspaces} onCreated={refreshAll} />
    </div>
  );
}
