import clsx from 'clsx';
import Spinner from './Spinner.jsx';

const variants = {
  primary: 'bg-[rgb(58,137,201)] text-white hover:brightness-95 disabled:opacity-50',
  secondary: 'bg-white text-ink border border-line hover:bg-surface dark:bg-dpanel dark:text-dink dark:border-dline dark:hover:bg-white/5',
  ghost: 'text-ink-soft hover:bg-black/5 dark:text-dink-soft dark:hover:bg-white/10',
  subtle: 'bg-black/5 text-ink hover:bg-black/10 dark:bg-white/10 dark:text-dink dark:hover:bg-white/15',
  danger: 'bg-danger text-white hover:brightness-95',
};

const sizes = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-[15px]',
  icon: 'h-8 w-8',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-70',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && <Spinner size={16} inline />}
      {children}
    </button>
  );
}
