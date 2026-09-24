import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor,
  closestCorners, useSensor, useSensors,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import api, { errorMessage } from '../lib/api.js';
import { useBoardStore, selectCards } from '../store/boardStore.js';
import { useBoardSocket } from '../hooks/useBoardSocket.js';
import { useToast } from '../context/ToastContext.jsx';

import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { ErrorState } from '../components/ui/States.jsx';
import { BoardPageSkeleton } from '../components/ui/Skeleton.jsx';
import BoardHeader from '../components/board/BoardHeader.jsx';
import ListColumn from '../components/board/ListColumn.jsx';
import AddListForm from '../components/board/AddListForm.jsx';
import CardTile from '../components/board/CardTile.jsx';
import CardModal from '../components/board/CardModal.jsx';

const EMPTY_FILTER = { text: '', labelId: null, memberId: null, status: null, priority: null };

export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    board, lists, cards, members, presence, starred, workspace, status, error,
    hydrate, setStatus, reset, upsertList, removeList, setLists,
    upsertCard, removeCard, moveCardLocal, moveListLocal, restoreCards, restoreLists, setStarred,
  } = useBoardStore();

  const [filter, setFilter] = useState(EMPTY_FILTER);
  const [openCardId, setOpenCardId] = useState(null);
  const [active, setActive] = useState(null); // { type, id }
  const [confirm, setConfirm] = useState(null);
  // Snapshot taken when a drag starts, so a failed move rolls all the way back.
  const dragSnapshot = useRef(null);

  // --- data ------------------------------------------------------------
  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const { data } = await api.get(`/boards/${boardId}`);
      hydrate(data);
    } catch (err) {
      setStatus('error', errorMessage(err));
    }
  }, [boardId, hydrate, setStatus]);

  useEffect(() => {
    load();
    return () => reset();
  }, [load, reset]);

  const onBoardDeleted = useCallback(() => {
    toast.error('This board was deleted');
    navigate('/');
  }, [toast, navigate]);

  useBoardSocket(boardId, { onBoardDeleted });

  // --- drag and drop ---------------------------------------------------
  const sensors = useSensors(
    // A small distance threshold keeps clicks (opening a card) separate from drags.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // On touch, a short hold starts the drag so the board can still be scrolled.
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Drag handlers read straight from the store: dnd-kit fires them faster than
  // React re-renders, so a closure over `cards` can be a frame behind.
  const listIdOf = useCallback((id) => {
    if (typeof id !== 'string') return null;
    if (id.startsWith('zone:') || id.startsWith('list:')) return id.split(':')[1];
    return useBoardStore.getState().cards.find((c) => c._id === id)?.list || null;
  }, []);

  const onDragStart = ({ active: a }) => {
    const { cards: c, lists: l } = useBoardStore.getState();
    dragSnapshot.current = { cards: c, lists: l };
    setActive({ type: a.data.current?.type, id: a.id });
  };

  /** While dragging a card over another column, move it there optimistically. */
  const onDragOver = ({ active: a, over }) => {
    if (!over || a.data.current?.type !== 'card') return;

    const current = useBoardStore.getState().cards;
    const fromList = current.find((c) => c._id === a.id)?.list;
    const toList = listIdOf(over.id);
    if (!toList || !fromList || fromList === toList) return;

    const target = selectCards(current, toList, null);
    const index = over.data.current?.type === 'card'
      ? target.findIndex((c) => c._id === over.id)
      : target.length;

    moveCardLocal(a.id, toList, index < 0 ? target.length : index);
  };

  const onDragEnd = async ({ active: a, over }) => {
    setActive(null);
    if (!over) return;

    if (a.data.current?.type === 'list') {
      const fromId = a.data.current.listId;
      const overListId = listIdOf(over.id);
      if (!overListId || overListId === fromId) return;

      const index = useBoardStore.getState().lists.findIndex((l) => l._id === overListId);
      moveListLocal(fromId, index);
      try {
        const { data } = await api.patch(`/lists/${fromId}/move`, { index });
        setLists(data.lists);
      } catch (err) {
        restoreLists(dragSnapshot.current.lists);
        toast.error(errorMessage(err, 'Could not reorder that list'));
      }
      return;
    }

    if (a.data.current?.type === 'card') {
      const toList = listIdOf(over.id);
      if (!toList) return;

      // Cards in the target column, as they stand after onDragOver.
      const target = selectCards(useBoardStore.getState().cards, toList, null);
      const index = over.data.current?.type === 'card'
        ? Math.max(0, target.findIndex((c) => c._id === over.id))
        : Math.max(0, target.length - 1);

      moveCardLocal(a.id, toList, index);
      try {
        const { data } = await api.patch(`/cards/${a.id}/move`, { listId: toList, index });
        upsertCard(data.card);
      } catch (err) {
        restoreCards(dragSnapshot.current.cards);
        toast.error(errorMessage(err, 'Could not move that card'));
      }
    }
  };

  // --- mutations -------------------------------------------------------
  const createList = async (title) => {
    try {
      const { data } = await api.post('/lists', { boardId, title });
      upsertList(data.list);
      return true;
    } catch (err) {
      toast.error(errorMessage(err));
      return false;
    }
  };

  const renameList = async (listId, title) => {
    const snapshot = lists;
    upsertList({ ...lists.find((l) => l._id === listId), title });
    try {
      const { data } = await api.patch(`/lists/${listId}`, { title });
      upsertList(data.list);
    } catch (err) {
      restoreLists(snapshot);
      toast.error(errorMessage(err));
    }
  };

  const deleteList = async (list) => {
    try {
      await api.delete(`/lists/${list._id}`);
      removeList(list._id);
      toast.success(`Deleted ${list.title}`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const createCard = async (listId, title) => {
    try {
      const { data } = await api.post('/cards', { listId, title });
      upsertCard(data.card);
      return true;
    } catch (err) {
      toast.error(errorMessage(err));
      return false;
    }
  };

  const updateCard = async (cardId, patch) => {
    const snapshot = cards;
    upsertCard({ ...cards.find((c) => c._id === cardId), ...patch });
    try {
      const { data } = await api.patch(`/cards/${cardId}`, patch);
      upsertCard(data.card);
    } catch (err) {
      restoreCards(snapshot);
      toast.error(errorMessage(err));
    }
  };

  const deleteCard = async (cardId) => {
    try {
      await api.delete(`/cards/${cardId}`);
      removeCard(cardId);
      toast.success('Card deleted');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const addComment = async (cardId, text) => {
    try {
      const { data } = await api.post(`/cards/${cardId}/comments`, { text });
      upsertCard(data.card);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const deleteComment = async (cardId, commentId) => {
    try {
      const { data } = await api.delete(`/cards/${cardId}/comments/${commentId}`);
      upsertCard(data.card);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const updateBoard = async (patch) => {
    try {
      const { data } = await api.patch(`/boards/${boardId}`, patch);
      useBoardStore.getState().setBoard(data.board);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const deleteBoard = async () => {
    try {
      await api.delete(`/boards/${boardId}`);
      toast.success('Board deleted');
      navigate('/');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const toggleStar = async () => {
    setStarred(!starred); // optimistic; the server is the source of truth on reload
    try {
      const { data } = await api.post(`/boards/${boardId}/star`);
      setStarred(data.starred);
    } catch (err) {
      setStarred(starred);
      toast.error(errorMessage(err));
    }
  };

  const addChecklistItem = async (cardId, text) => {
    try {
      const { data } = await api.post(`/cards/${cardId}/checklist`, { text });
      upsertCard(data.card);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const toggleChecklistItem = async (cardId, itemId) => {
    try {
      const { data } = await api.patch(`/cards/${cardId}/checklist/${itemId}/toggle`);
      upsertCard(data.card);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const deleteChecklistItem = async (cardId, itemId) => {
    try {
      const { data } = await api.delete(`/cards/${cardId}/checklist/${itemId}`);
      upsertCard(data.card);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const addAttachment = async (cardId, payload) => {
    try {
      const { data } = await api.post(`/cards/${cardId}/attachments`, payload);
      upsertCard(data.card);
      return true;
    } catch (err) {
      toast.error(errorMessage(err));
      return false;
    }
  };

  const deleteAttachment = async (cardId, attachmentId) => {
    try {
      const { data } = await api.delete(`/cards/${cardId}/attachments/${attachmentId}`);
      upsertCard(data.card);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  // --- render ----------------------------------------------------------
  const openCard = useMemo(() => cards.find((c) => c._id === openCardId) || null, [cards, openCardId]);
  const activeCard = active?.type === 'card' ? cards.find((c) => c._id === active.id) : null;
  const activeList = active?.type === 'list' ? lists.find((l) => `list:${l._id}` === active.id) : null;

  if (status === 'loading' || status === 'idle') {
    return <BoardPageSkeleton />;
  }
  if (status === 'error') {
    return <div className="p-8"><ErrorState message={error} onRetry={load} /></div>;
  }

  return (
    <div
      className={`flex h-full flex-col ${!board.backgroundImage ? `bg-board-${board.background}` : ''}`}
      style={board.backgroundImage ? { backgroundImage: `url(${board.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      <BoardHeader
        board={board}
        members={members}
        presence={presence}
        filter={filter}
        setFilter={setFilter}
        starred={starred}
        onToggleStar={toggleStar}
        workspaceId={workspace?._id}
        workspaceName={workspace?.name}
        onInvited={load}
        onRename={(title) => updateBoard({ title })}
        onChangeBackground={(background) => updateBoard({ background })}
        onChangeBackgroundImage={(backgroundImage) => updateBoard({ backgroundImage })}
        onDelete={() =>
          setConfirm({
            title: `Delete ${board.title}?`,
            description: 'Every list and card on it goes too.',
            onConfirm: deleteBoard,
          })
        }
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          // Put everything back the way it was before the drag started.
          if (dragSnapshot.current) {
            restoreCards(dragSnapshot.current.cards);
            restoreLists(dragSnapshot.current.lists);
          }
          setActive(null);
        }}
      >
        <div className="scrollbar-thin flex min-h-0 flex-1 gap-3 overflow-x-auto p-3">
          <SortableContext items={lists.map((l) => `list:${l._id}`)} strategy={horizontalListSortingStrategy}>
            {lists.map((list) => (
              <ListColumn
                key={list._id}
                list={list}
                cards={selectCards(cards, list._id, filter)}
                labels={board.labels}
                onOpenCard={setOpenCardId}
                onRename={renameList}
                onCreateCard={createCard}
                onDelete={(l) =>
                  setConfirm({
                    title: `Delete ${l.title}?`,
                    description: 'The cards in this list are deleted with it.',
                    onConfirm: () => deleteList(l),
                  })
                }
              />
            ))}
          </SortableContext>

          <AddListForm onCreate={createList} />
        </div>

        {/* The overlay is what follows the cursor, so the original keeps its slot. */}
        <DragOverlay dropAnimation={{ duration: 160 }}>
          {activeCard && <div className="w-[270px]"><CardTile card={activeCard} labels={board.labels} dragging /></div>}
          {activeList && (
            <div className="w-[286px] rounded-xl2 bg-surface p-2 shadow-lift">
              <p className="px-1 py-1 text-[13.5px] font-bold">{activeList.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <CardModal
        open={!!openCard}
        card={openCard}
        list={lists.find((l) => l._id === openCard?.list)}
        board={board}
        members={members}
        onClose={() => setOpenCardId(null)}
        onUpdate={(patch) => updateCard(openCard._id, patch)}
        onDelete={() => deleteCard(openCard._id)}
        onComment={(text) => addComment(openCard._id, text)}
        onDeleteComment={(commentId) => deleteComment(openCard._id, commentId)}
        onChecklistAdd={(text) => addChecklistItem(openCard._id, text)}
        onChecklistToggle={(itemId) => toggleChecklistItem(openCard._id, itemId)}
        onChecklistDelete={(itemId) => deleteChecklistItem(openCard._id, itemId)}
        onAttachmentAdd={(payload) => addAttachment(openCard._id, payload)}
        onAttachmentDelete={(attachmentId) => deleteAttachment(openCard._id, attachmentId)}
      />

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.title}
        description={confirm?.description}
        onConfirm={() => confirm?.onConfirm()}
      />
    </div>
  );
}
