import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import clsx from 'clsx';

export default function BoardTile({ board, workspaceName, starred = false }) {
  return (
    <Link
      to={`/boards/${board._id}`}
      className={clsx(
        'group relative flex h-28 flex-col justify-end overflow-hidden rounded-xl2 p-3 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift',
        !board.backgroundImage && `bg-board-${board.background}`
      )}
      style={board.backgroundImage ? { backgroundImage: `url(${board.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      <span className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent transition-colors group-hover:from-ink/65" />
      {starred && (
        <span className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full bg-white/25 text-amber-300 backdrop-blur-sm">
          <Star size={13} fill="currentColor" />
        </span>
      )}
      <span className="relative text-[15px] font-bold leading-tight text-white drop-shadow-sm">{board.title}</span>
      {workspaceName && <span className="relative mt-0.5 text-[12px] text-white/85">{workspaceName}</span>}
    </Link>
  );
}
