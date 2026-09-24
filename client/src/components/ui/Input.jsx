import clsx from 'clsx';
import { forwardRef } from 'react';

const base =
  'w-full rounded-lg border bg-[rgb(58,137,201)] px-3 text-sm text-white placeholder:text-ink-faint transition-colors focus:border-white focus:ring-0 focus:outline-none ';


const Input = forwardRef(function Input({ label, error, hint, className, as = 'input', ...props }, ref) {
  const Tag = as;
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-[13px] font-semibold " style={{ color: 'rgb(58, 137, 201)' }}>{label}</span>}
      <Tag
        ref={ref}
        {...props}
        className={clsx(
          base,
          as === 'textarea' ? 'min-h-[96px] resize-y py-2.5 leading-relaxed' : 'h-10',
          error ? 'border-danger' : 'border-line ',
          className
        )}
      />
      {error && <span className="mt-1.5 block text-[13px] text-danger">{error}</span>}
      {!error && hint && <span className="mt-1.5 block text-[13px] text-ink-faint dark:text-dink-faint">{hint}</span>}
    </label>
  );
});

export default Input;
