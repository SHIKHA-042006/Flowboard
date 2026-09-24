import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid, Plus, Users, X, SquareKanban, ListChecks, Star, Clock, LayoutTemplate, Settings,
} from 'lucide-react';
import clsx from 'clsx';
import Spinner from '../ui/Spinner.jsx';
import CreateWorkspaceModal from './CreateWorkspaceModal.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/my-tasks', label: 'My Tasks', icon: ListChecks },
  { to: '/starred', label: 'Starred', icon: Star },
  { to: '/recent', label: 'Recent', icon: Clock },
];

const NAV_ITEMS_BOTTOM = [
  { to: '/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function NavItem({ to, label, icon: Icon, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
          isActive
            ? 'bg-accent-soft text-accent dark:bg-accent/15'
            : 'text-ink-soft hover:bg-surface dark:text-dink-soft dark:hover:bg-white/5'
        )
      }
    >
      <Icon size={17} /> {label}
    </NavLink>
  );
}

export default function Sidebar({ workspaces, status, onChanged, open, onClose }) {
  const [creating, setCreating] = useState(false);

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={onClose} aria-hidden />}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-line bg-panel transition-transform lg:static lg:translate-x-0',
          'dark:border-dline dark:bg-dpanel',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <NavLink to="/" className="flex items-center gap-2" onClick={onClose}>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-hover text-white shadow-card">
              <SquareKanban size={18} />
            </span>
            <span className="text-lg font-bold tracking-tight">Flowboard</span>
          </NavLink>
          <button className="p-1 text-ink-soft lg:hidden" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-0.5 px-3">
          {NAV_ITEMS.map((item) => <NavItem key={item.to} {...item} onClick={onClose} />)}
        </nav>

        <div className="mt-5 flex items-center justify-between px-5">
          <h2 className="text-[13px] font-bold text-ink-faint dark:text-dink-faint">Workspaces</h2>
          <button
            onClick={() => setCreating(true)}
            className="rounded p-1 text-ink-soft hover:bg-surface dark:text-dink-soft dark:hover:bg-white/10"
            aria-label="Create workspace"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="scrollbar-thin mt-2 flex-1 overflow-y-auto px-3">
          {status === 'loading' && (
            <div className="py-8">
              <Spinner label="Loading workspaces" />
            </div>
          )}

          {status === 'ready' && workspaces.length === 0 && (
            <p className="px-2 py-4 text-sm text-ink-soft dark:text-dink-soft">
              No workspaces yet. Create one to start a board.
            </p>
          )}

          {workspaces.map((ws) => (
            <div key={ws._id} className="mb-3">
              <NavLink
                to={`/workspaces/${ws._id}`}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold',
                    isActive
                      ? 'bg-accent-soft text-accent dark:bg-accent/15'
                      : 'text-ink hover:bg-surface dark:text-dink dark:hover:bg-white/5'
                  )
                }
              >
                <Users size={16} className="shrink-0" />
                <span className="truncate">{ws.name}</span>
              </NavLink>

              <ul className="mt-1 space-y-0.5 pl-4">
                {ws.boards?.slice(0, 6).map((b) => (
                  <li key={b._id}>
                    <NavLink
                      to={`/boards/${b._id}`}
                      onClick={onClose}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px]',
                          isActive
                            ? 'bg-surface font-semibold text-ink dark:bg-white/10 dark:text-dink'
                            : 'text-ink-soft hover:bg-surface dark:text-dink-soft dark:hover:bg-white/5'
                        )
                      }
                    >
                      <span className={`h-3.5 w-3.5 shrink-0 rounded bg-board-${b.background}`} />
                      <span className="truncate">{b.title}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <nav className="space-y-0.5 border-t border-line px-3 py-3 dark:border-dline">
          {NAV_ITEMS_BOTTOM.map((item) => <NavItem key={item.to} {...item} onClick={onClose} />)}
        </nav>
      </aside>

      <CreateWorkspaceModal open={creating} onClose={() => setCreating(false)} onCreated={onChanged} />
    </>
  );
}
