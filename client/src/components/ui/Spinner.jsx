import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 22, label, inline = false }) {
  const icon = <Loader2 size={size} className="animate-spin text-accent" aria-hidden />;
  if (inline) return icon;

  return (
    <div className="flex flex-col items-center gap-3 text-sm text-ink-soft" role="status">
      {icon}
      {label && <span>{label}</span>}
    </div>
  );
}
