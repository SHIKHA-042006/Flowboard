import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CardTile from './CardTile.jsx';

export default function SortableCard({ card, labels, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { type: 'card', listId: card.list },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }}
      {...attributes}
      {...listeners}
    >
      <CardTile card={card} labels={labels} onClick={() => onOpen(card._id)} />
    </div>
  );
}
