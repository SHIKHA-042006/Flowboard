import { useNavigate } from 'react-router-dom';
import { HelpCircle, LogOut, Menu, Moon, Sun, SunMoon, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import Avatar from '../ui/Avatar.jsx';
import Dropdown, { MenuItem } from '../ui/Dropdown.jsx';
import GlobalSearch from './GlobalSearch.jsx';
import NotificationsPanel from './NotificationsPanel.jsx';
import CreateMenu from './CreateMenu.jsx';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: SunMoon },
];

export default function Topbar({ onMenu, workspaces = [], onWorkspacesChanged }) {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const { preference, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-panel px-4 dark:border-dline dark:bg-dpanel">
      <button onClick={onMenu} className="rounded p-1.5 text-ink-soft hover:bg-surface dark:text-dink-soft dark:hover:bg-white/10 lg:hidden" aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className="hidden flex-1 sm:block">
        <GlobalSearch />
      </div>
      <div className="flex-1 sm:hidden" />

      <span
        className="hidden items-center gap-1.5 text-[13px] text-ink-soft dark:text-dink-soft md:flex"
        title={connected ? 'Live updates are on' : 'Reconnecting to live updates'}
      >
        <span className={`h-2 w-2 rounded-full ${connected ? 'bg-accent' : 'bg-ink-faint'}`} />
        {connected ? 'Live' : 'Offline'}
      </span>

      <CreateMenu workspaces={workspaces} onChanged={onWorkspacesChanged} />

      <NotificationsPanel />

      <Dropdown
        width="w-48"
        trigger={({ toggle }) => (
          <button onClick={toggle} className="rounded-lg p-2 text-ink-soft hover:bg-surface dark:text-dink-soft dark:hover:bg-white/10" aria-label="Help">
            <HelpCircle size={18} />
          </button>
        )}
      >
        {() => (
          <>
            <p className="px-2.5 pb-1.5 pt-1 text-[12px] font-bold text-ink-faint dark:text-dink-faint">Help</p>
            <MenuItem onClick={() => window.open('https://github.com', '_blank')}>Keyboard shortcuts</MenuItem>
            <MenuItem onClick={() => window.open('https://github.com', '_blank')}>Documentation</MenuItem>
            <MenuItem onClick={() => window.open('mailto:support@flowboard.dev')}>Contact support</MenuItem>
          </>
        )}
      </Dropdown>

      <Dropdown
        trigger={({ toggle }) => (
          <button onClick={toggle} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-surface dark:hover:bg-white/10">
            <Avatar user={user} size={30} />
            <span className="hidden text-sm font-semibold sm:block">{user?.name}</span>
          </button>
        )}
      >
        {() => (
          <>
            <div className="px-2.5 pb-2 pt-1">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-[13px] text-ink-soft dark:text-dink-soft">{user?.email}</p>
            </div>
            <div className="my-1 h-px bg-line dark:bg-dline" />

            <MenuItem icon={UserIcon} onClick={() => navigate('/settings')}>Profile & settings</MenuItem>

            <div className="px-2.5 py-1.5">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-faint dark:text-dink-faint">Theme</p>
              <div className="flex gap-1 rounded-lg bg-surface p-1 dark:bg-white/5">
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    aria-pressed={preference === value}
                    className={`flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 text-[10.5px] font-semibold transition-colors ${
                      preference === value ? 'bg-white text-accent shadow-card dark:bg-dpanel' : 'text-ink-soft dark:text-dink-soft'
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="my-1 h-px bg-line dark:bg-dline" />
            <MenuItem icon={LogOut} onClick={logout}>Sign out</MenuItem>
          </>
        )}
      </Dropdown>
    </header>
  );
}
