import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import { useWorkspaces } from '../../hooks/useWorkspaces.js';

/**
 * One shell for every signed-in page: fixed sidebar on desktop, slide-over on
 * mobile. Workspace data is loaded once here and passed down, so navigating
 * between boards never refetches the sidebar.
 */
export default function AppShell() {
  const [navOpen, setNavOpen] = useState(false);
  const { workspaces, status, reload } = useWorkspaces();

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar
        workspaces={workspaces}
        status={status}
        onChanged={reload}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setNavOpen(true)} workspaces={workspaces} onWorkspacesChanged={reload} />
        <main className="min-h-0 flex-1 overflow-hidden bg-surface dark:bg-dsurface">
          <Outlet context={{ workspaces, reloadWorkspaces: reload }} />
        </main>
      </div>
    </div>
  );
}
