import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import api, { errorMessage } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';

/** Adding someone always happens at the workspace level; used from the workspace page and from a board's Invite button. */
export default function InviteMemberModal({ open, onClose, workspaceId, workspaceName, onDone }) {
  const [form, setForm] = useState({ email: '', role: 'member' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post(`/workspaces/${workspaceId}/members`, form);
      toast.success('Added to the workspace');
      onDone?.();
      onClose();
      setForm({ email: '', role: 'member' });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite to workspace"
      description={workspaceName ? `They'll get access to every board in ${workspaceName}.` : "They need a Flowboard account first."}
    >
      <form onSubmit={submit} className="space-y-3">
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="grace@flowboard.dev"
          error={error}
          required
          autoFocus
        />
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft dark:text-dink-soft">Role</span>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm dark:border-dline dark:bg-dpanel"
          >
            <option value="member">Member — can use boards</option>
            <option value="admin">Admin — can manage people and boards</option>
          </select>
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy}>Send invite</Button>
        </div>
      </form>
    </Modal>
  );
}
