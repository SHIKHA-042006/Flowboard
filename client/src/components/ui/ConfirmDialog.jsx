import { useState } from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

/** Every destructive action routes through here — nothing deletes on one click. */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Delete',
  tone = 'danger',
}) {
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant={tone} onClick={confirm} loading={busy}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-sm text-ink-soft dark:text-dink-soft">This cannot be undone.</p>
    </Modal>
  );
}
