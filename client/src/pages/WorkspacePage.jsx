import { useCallback, useEffect, useState } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, UserPlus, LayoutGrid, Settings, Clock3 } from 'lucide-react';
import api, { errorMessage } from '../lib/api.js';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Avatar, { AvatarGroup } from '../components/ui/Avatar.jsx';
import { EmptyState, ErrorState } from '../components/ui/States.jsx';
import BoardTile from '../components/board/BoardTile.jsx';
import CreateBoardModal from '../components/board/CreateBoardModal.jsx';
import ActivityFeedItem from '../components/board/ActivityFeedItem.jsx';
import InviteMemberModal from '../components/layout/InviteMemberModal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const { reloadWorkspaces } = useOutletContext();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [activity, setActivity] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [invite, setInvite] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [res, activityRes] = await Promise.all([
        api.get(`/workspaces/${workspaceId}`),
        api.get(`/workspaces/${workspaceId}/activity`),
      ]);
      setData(res.data);
      setActivity(activityRes.data.activity);
      setStatus('ready');
    } catch (err) {
      setError(errorMessage(err));
      setStatus('error');
    }
  }, [workspaceId]);

  useEffect(() => { load(); }, [load]);

  const refresh = () => { load(); reloadWorkspaces(); };

  const removeMember = async (userId) => {
    try {
      await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
      toast.success('Removed from workspace');
      refresh();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const deleteWorkspace = async () => {
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      toast.success('Workspace deleted');
      reloadWorkspaces();
      navigate('/');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (status === 'loading') {
    return <div className="grid h-full place-items-center"><Spinner label="Loading workspace" /></div>;
  }
  if (status === 'error') {
    return <div className="p-8"><ErrorState message={error} onRetry={load} /></div>;
  }

  const { workspace, boards, role } = data;
  const isAdmin = role === 'admin';
  const starredCount = boards.filter((b) => b.starred).length;

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      {/* Header banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-ink via-[#26364A] to-[#16202C] px-5 py-8 text-white sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[12px] font-bold uppercase tracking-wide text-white/60">Workspace</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{workspace.name}</h1>
              {workspace.description && <p className="mt-2 max-w-xl text-[13.5px] text-white/75">{workspace.description}</p>}
              <div className="mt-4 flex items-center gap-3">
                <AvatarGroup users={workspace.members.map((m) => m.user)} size={30} max={6} />
                <span className="text-[13px] text-white/70">
                  {workspace.members.length} {workspace.members.length === 1 ? 'member' : 'members'} · {boards.length} boards
                  {starredCount > 0 && ` · ${starredCount} starred`}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-white/20" onClick={() => setInvite(true)}>
                  <UserPlus size={16} /> Add people
                </Button>
              )}
              <Button onClick={() => setCreatingBoard(true)}>
                <Plus size={17} /> New board
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <section>
              <h2 className="mb-3 text-[13px] font-bold text-ink-faint dark:text-dink-faint">Boards</h2>
              {boards.length === 0 ? (
                <EmptyState
                  icon={LayoutGrid}
                  title="No boards in this workspace"
                  description="A board holds your lists and cards."
                  action={<Button onClick={() => setCreatingBoard(true)}><Plus size={17} /> New board</Button>}
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {boards.map((b) => <BoardTile key={b._id} board={b} starred={b.starred} />)}
                </div>
              )}
            </section>

            <section className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-bold text-ink-faint dark:text-dink-faint">People</h2>
                <span className="flex items-center gap-1 text-[12px] font-semibold text-ink-faint dark:text-dink-faint">
                  <Settings size={12} /> {isAdmin ? 'You can manage roles' : 'Admins manage roles'}
                </span>
              </div>
              <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl2 border border-line bg-panel dark:divide-dline dark:border-dline dark:bg-dpanel">
                {workspace.members.map((m) => {
                  const isOwner = workspace.owner === m.user._id || workspace.owner?._id === m.user._id;
                  return (
                    <li key={m.user._id} className="flex items-center gap-3 px-4 py-3">
                      <Avatar user={m.user} size={34} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{m.user.name}</p>
                        <p className="truncate text-[13px] text-ink-soft dark:text-dink-soft">{m.user.email}</p>
                      </div>

                      {isAdmin && !isOwner ? (
                        <select
                          value={m.role}
                          onChange={async (e) => {
                            try {
                              await api.patch(`/workspaces/${workspaceId}/members/${m.user._id}`, { role: e.target.value });
                              toast.success('Role updated');
                              refresh();
                            } catch (err) {
                              toast.error(errorMessage(err));
                            }
                          }}
                          className="h-8 rounded-lg border border-line bg-white px-2 text-[13px] dark:border-dline dark:bg-dpanel"
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                        </select>
                      ) : (
                        <span className="rounded-full bg-surface px-2.5 py-1 text-[12px] font-semibold text-ink-soft dark:bg-white/10 dark:text-dink-soft">
                          {isOwner ? 'Owner' : m.role}
                        </span>
                      )}

                      {!isOwner && (isAdmin || m.user._id === user._id) && (
                        <button
                          onClick={() =>
                            setConfirm({
                              title: m.user._id === user._id ? 'Leave this workspace?' : `Remove ${m.user.name}?`,
                              confirmLabel: m.user._id === user._id ? 'Leave' : 'Remove',
                              onConfirm: () => removeMember(m.user._id),
                            })
                          }
                          className="rounded p-1.5 text-ink-soft hover:bg-danger-soft hover:text-danger dark:text-dink-soft"
                          aria-label={`Remove ${m.user.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>

              {isAdmin && (
                <button
                  onClick={() =>
                    setConfirm({
                      title: `Delete ${workspace.name}?`,
                      description: 'Every board, list and card in it is deleted too.',
                      onConfirm: deleteWorkspace,
                    })
                  }
                  className="mt-4 text-[13px] font-semibold text-danger hover:underline"
                >
                  Delete this workspace
                </button>
              )}
            </section>
          </div>

          <aside>
            <h2 className="mb-3 flex items-center gap-1.5 text-[13px] font-bold text-ink-faint dark:text-dink-faint">
              <Clock3 size={14} /> Workspace activity
            </h2>
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
          </aside>
        </div>
      </div>

      <CreateBoardModal
        open={creatingBoard}
        onClose={() => setCreatingBoard(false)}
        workspaceId={workspaceId}
        onCreated={refresh}
      />
      <InviteMemberModal
        open={invite}
        onClose={() => setInvite(false)}
        workspaceId={workspaceId}
        workspaceName={workspace.name}
        onDone={refresh}
      />
      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.title}
        description={confirm?.description}
        confirmLabel={confirm?.confirmLabel}
        onConfirm={() => confirm?.onConfirm()}
      />
    </div>
  );
}
