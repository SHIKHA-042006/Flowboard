import clsx from 'clsx';

export default function Skeleton({ className }) {
  return <div className={clsx('animate-pulse rounded-lg bg-black/[.06] dark:bg-white/[.08]', className)} />;
}

export function BoardTileSkeleton() {
  return <Skeleton className="h-28 rounded-xl2" />;
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-80" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
      <Skeleton className="mt-10 h-4 w-40" />
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <BoardTileSkeleton key={i} />)}
      </div>
    </div>
  );
}

export function BoardPageSkeleton() {
  return (
    <div className="flex h-full gap-3 overflow-hidden bg-surface p-3 dark:bg-dsurface">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-[286px] shrink-0 space-y-2 rounded-xl2 bg-white/60 p-2.5 dark:bg-dpanel/60">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ))}
    </div>
  );
}
