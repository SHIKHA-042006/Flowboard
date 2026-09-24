import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { LayoutTemplate, Sparkles } from 'lucide-react';
import api, { errorMessage } from '../lib/api.js';
import { TEMPLATES } from '../lib/templates.js';
import Modal from '../components/ui/Modal.jsx';
import Button from '../components/ui/Button.jsx';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Templates are static data — "using" one just calls the existing
 * board/list/card APIs in sequence, so no new backend concept is needed.
 */
export default function TemplatesPage() {
  const { workspaces, reloadWorkspaces } = useOutletContext();
  const [picking, setPicking] = useState(null);
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?._id || '');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const apply = async () => {
    if (!picking || !workspaceId) return;
    setBusy(true);
    try {
      const { data: boardRes } = await api.post('/boards', {
        title: picking.name,
        workspaceId,
        background: picking.background,
      });
      const board = boardRes.board;
      await api.patch(`/boards/${board._id}`, { backgroundImage: picking.backgroundImage });

      // The board API seeds three default lists; remove them so the template
      // fully controls the column layout instead of layering on top.
      const { data: boardData } = await api.get(`/boards/${board._id}`);
      await Promise.all(boardData.lists.map((l) => api.delete(`/lists/${l._id}`)));

      for (const list of picking.lists) {
        const { data: listRes } = await api.post('/lists', { boardId: board._id, title: list.title });
        for (const cardTitle of list.cards) {
          await api.post('/cards', { listId: listRes.list._id, title: cardTitle });
        }
      }

      toast.success(`${picking.name} board created`);
      reloadWorkspaces();
      setPicking(null);
      navigate(`/boards/${board._id}`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <LayoutTemplate size={22} className="text-accent" /> Templates
        </h1>
        <p className="mt-1 max-w-xl text-sm text-ink-soft dark:text-dink-soft">
          Start from a ready-made structure instead of a blank board. Pick one and it's created with lists and starter cards already in place.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setPicking(t)}
              className="group flex flex-col overflow-hidden rounded-xl2 border border-line bg-panel text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift dark:border-dline dark:bg-dpanel"
            >
              <div
                className={`relative h-28 bg-board-${t.background}`}
                style={{ backgroundImage: `url(${t.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <span className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                <span className="absolute bottom-2.5 left-3 grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-accent">
                  <t.icon size={16} />
                </span>
              </div>
              <div className="p-4">
                <p className="font-bold">{t.name}</p>
                <p className="mt-1 text-[13px] text-ink-soft dark:text-dink-soft">{t.description}</p>
                <p className="mt-3 text-[12px] font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  Use this template →
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Modal
        open={!!picking}
        onClose={() => setPicking(null)}
        title={picking ? `Use "${picking.name}"` : ''}
        description="Choose which workspace this board belongs to."
        footer={
          <>
            <Button variant="secondary" onClick={() => setPicking(null)} disabled={busy}>Cancel</Button>
            <Button onClick={apply} loading={busy} disabled={!workspaceId}>
              <Sparkles size={15} /> Create board
            </Button>
          </>
        }
      >
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft dark:text-dink-soft">Workspace</span>
          <select
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm dark:border-dline dark:bg-dpanel"
          >
            {workspaces.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
          </select>
        </label>

        {picking && (
          <div className="mt-4 rounded-lg bg-surface p-3 text-[13px] dark:bg-white/5">
            <p className="font-semibold">This creates {picking.lists.length} lists:</p>
            <p className="mt-1 text-ink-soft dark:text-dink-soft">{picking.lists.map((l) => l.title).join(' · ')}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
