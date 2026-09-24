import BoardTile from '../board/BoardTile.jsx';
import { EmptyState } from '../ui/States.jsx';

export default function BoardRow({ title, icon: Icon, boards = [], emptyLabel, action }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[13px] font-bold text-ink-faint dark:text-dink-faint">
          {Icon && <Icon size={14} />} {title}
        </h2>
        {action}
      </div>

      {boards.length === 0 ? (
        <EmptyState icon={Icon} title={emptyLabel || 'Nothing here yet'} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boards.map((b) => (
            <BoardTile key={b._id} board={b} workspaceName={b.workspaceName} starred={b.starred} />
          ))}
        </div>
      )}
    </section>
  );
}
