import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

/** Click-outside popover used for menus, label pickers and member pickers. */
export default function Dropdown({ trigger, children, align = 'right', width = 'w-60' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          className={clsx(
            'absolute z-40 mt-2 rounded-xl2 border border-line bg-panel p-2 shadow-lift dark:border-dline dark:bg-dpanel',
            width,
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({ icon: Icon, children, tone, ...props }) {
  return (
    <button
      {...props}
      className={clsx(
        'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-surface dark:hover:bg-white/5',
        tone === 'danger' ? 'text-danger' : 'text-ink dark:text-dink'
      )}
    >
      {Icon && <Icon size={16} aria-hidden />}
      {children}
    </button>
  );
}
