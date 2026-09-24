import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AppShell from './components/layout/AppShell.jsx';
import Spinner from './components/ui/Spinner.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import WorkspacePage from './pages/WorkspacePage.jsx';
import BoardPage from './pages/BoardPage.jsx';
import MyTasksPage from './pages/MyTasksPage.jsx';
import StarredPage from './pages/StarredPage.jsx';
import RecentPage from './pages/RecentPage.jsx';
import TemplatesPage from './pages/TemplatesPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function Protected({ children }) {
  const { user, booting } = useAuth();
  if (booting) return <FullScreenLoader />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  const { user, booting } = useAuth();
  if (booting) return <FullScreenLoader />;
  return user ? <Navigate to="/" replace /> : children;
}

function FullScreenLoader() {
  return (
    <div className="grid h-full place-items-center bg-surface dark:bg-dsurface">
      <Spinner label="Loading your boards" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />

      <Route element={<Protected><AppShell /></Protected>}>
        <Route index element={<DashboardPage />} />
        <Route path="/my-tasks" element={<MyTasksPage />} />
        <Route path="/starred" element={<StarredPage />} />
        <Route path="/recent" element={<RecentPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/workspaces/:workspaceId" element={<WorkspacePage />} />
        <Route path="/boards/:boardId" element={<BoardPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
