import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { useBoardStore } from '../store/boardStore.js';
import { getSocketId } from '../lib/api.js';

/**
 * Joins the board room and folds every broadcast into the store.
 * Events that this tab caused (origin === our socket id) are skipped: the
 * optimistic update already applied them.
 */
export function useBoardSocket(boardId, { onBoardDeleted } = {}) {
  const { socket } = useSocket();
  const store = useBoardStore;

  useEffect(() => {
    if (!socket || !boardId) return;

    const mine = (payload) => payload?.origin && payload.origin === getSocketId();

    const handlers = {
      'list:created': (p) => !mine(p) && store.getState().upsertList(p.list),
      'list:updated': (p) => !mine(p) && store.getState().upsertList(p.list),
      'list:moved': (p) => !mine(p) && store.getState().setLists(p.lists),
      'list:deleted': (p) => !mine(p) && store.getState().removeList(p.listId),
      'card:created': (p) => !mine(p) && store.getState().upsertCard(p.card),
      'card:updated': (p) => !mine(p) && store.getState().upsertCard(p.card),
      'card:moved': (p) => !mine(p) && store.getState().upsertCard(p.card),
      'card:deleted': (p) => !mine(p) && store.getState().removeCard(p.cardId),
      'board:updated': (p) => !mine(p) && store.getState().setBoard(p.board),
      'board:deleted': () => onBoardDeleted?.(),
      'presence:update': (people) => store.getState().setPresence(people),
    };

    const join = () => socket.emit('board:join', boardId);
    join();
    socket.on('connect', join); // rejoin after a reconnect

    Object.entries(handlers).forEach(([event, fn]) => socket.on(event, fn));

    return () => {
      socket.emit('board:leave', boardId);
      socket.off('connect', join);
      Object.entries(handlers).forEach(([event, fn]) => socket.off(event, fn));
    };
  }, [socket, boardId, store, onBoardDeleted]);
}
