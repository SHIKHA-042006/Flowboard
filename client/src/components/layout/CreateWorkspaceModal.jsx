import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import api, { errorMessage } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';

/** Extracted so both the sidebar and the navbar Create menu can open it. */
export default function CreateWorkspaceModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data } = await api.post('/workspaces', form);
      toast.success('Workspace created');
      onCreated?.();
      onClose();
      setForm({ name: '', description: '' });
      navigate(`/workspaces/${data.workspace._id}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New workspace" description="Group related boards and people.">
      <form onSubmit={submit} className="space-y-3">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Northwind Studio"
          error={error}
          required
          autoFocus
        />
        <Input
          as="textarea"
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="What this workspace is for"
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy}>Create workspace</Button>
        </div>
      </form>
    </Modal>
  );
}
