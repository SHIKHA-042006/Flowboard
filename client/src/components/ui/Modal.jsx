import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';

export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/45 p-4 sm:p-8">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={clsx(
          'relative z-10 w-full rounded-xl2 bg-panel shadow-panel dark:bg-dpanel',
          size === 'lg' ? 'max-w-3xl' : size === 'sm' ? 'max-w-sm' : 'max-w-lg'
        )}
      >
        <div className="flex items-start gap-4 border-b border-line px-5 py-4 dark:border-dline">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold leading-snug">{title}</h2>
            {description && <p className="mt-1 text-sm text-ink-soft dark:text-dink-soft">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-ink-soft hover:bg-black/5 dark:text-dink-soft dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-3 dark:border-dline">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
