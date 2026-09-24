import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import api, { errorMessage } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';

const BACKGROUNDS = ['slate', 'teal', 'indigo', 'amber', 'rose', 'forest'];

export default function CreateBoardModal({ open, onClose, workspaces = [], workspaceId, onCreated }) {
  const [title, setTitle] = useState('');
  const [background, setBackground] = useState('teal');
  const [target, setTarget] = useState(workspaceId || workspaces[0]?._id || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data } = await api.post('/boards', {
        title,
        background,
        workspaceId: workspaceId || target,
      });
      toast.success('Board created');
      onCreated?.();
      onClose();
      setTitle('');
      navigate(`/boards/${data.board._id}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New board" description="It starts with Backlog, In progress and Done.">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Board title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Mobile app launch"
          error={error}
          required
          autoFocus
        />

        {!workspaceId && (
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft dark:text-dink-soft">Workspace</span>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm dark:border-dline dark:bg-dpanel dark:text-dink"
            >
              {workspaces.map((w) => (
                <option key={w._id} value={w._id}>{w.name}</option>
              ))}
            </select>
          </label>
        )}

        <div>
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft dark:text-dink-soft">Background</span>
          <div className="flex gap-2">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => setBackground(bg)}
                aria-label={bg}
                aria-pressed={background === bg}
                className={clsx(
                  `h-10 w-full rounded-lg bg-board-${bg} transition-transform`,
                  background === bg ? 'ring-2 ring-ink ring-offset-2' : 'hover:scale-[1.03]'
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy}>Create board</Button>
        </div>
      </form>
    </Modal>
  );
}
