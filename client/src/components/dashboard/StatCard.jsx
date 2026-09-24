export default function StatCard({ icon: Icon, label, value, tone = 'accent' }) {
  const tones = {
    accent: 'bg-accent-soft text-accent dark:bg-accent/15',
    amber: 'bg-warn-soft text-warn dark:bg-warn/15',
    rose: 'bg-danger-soft text-danger dark:bg-danger/15',
    slate: 'bg-surface text-ink-soft dark:bg-white/10 dark:text-dink-soft',
  };

  return (
    <div className="flex items-center gap-3 rounded-xl2 border border-line bg-panel p-4 shadow-card dark:border-dline dark:bg-dpanel">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>
        <Icon size={19} />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-none">{value}</p>
        <p className="mt-1 truncate text-[12.5px] text-ink-soft dark:text-dink-soft">{label}</p>
      </div>
    </div>
  );
}
