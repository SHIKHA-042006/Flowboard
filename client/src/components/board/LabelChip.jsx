import clsx from 'clsx';

export default function LabelChip({ label, size = 'sm', onClick, selected }) {
  if (!label) return null;
  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      title={label.name}
      style={{ backgroundColor: label.color }}
      className={clsx(
        'inline-flex items-center rounded font-semibold text-white',
        size === 'sm' ? 'h-2 w-9' : 'h-6 px-2 text-[12px]',
        onClick && 'cursor-pointer',
        selected && 'ring-2 ring-ink ring-offset-1'
      )}
    >
      {size !== 'sm' && label.name}
    </span>
  );
}
