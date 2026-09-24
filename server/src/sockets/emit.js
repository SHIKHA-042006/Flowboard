import { boardRoom } from './index.js';

/**
 * Broadcasts a mutation to everyone watching a board.
 * `origin` is the socket id of the tab that triggered the change; that client
 * ignores the echo because it already applied the change optimistically.
 */
export function emitBoard(req, boardId, event, payload) {
  const io = req.app.get('io');
  if (!io) return;
  io.to(boardRoom(boardId.toString())).emit(event, {
    ...payload,
    origin: req.socketId || null,
    actor: { _id: req.user._id, name: req.user.name },
  });
}

export const EVENTS = {
  LIST_CREATED: 'list:created',
  LIST_UPDATED: 'list:updated',
  LIST_MOVED: 'list:moved',
  LIST_DELETED: 'list:deleted',
  CARD_CREATED: 'card:created',
  CARD_UPDATED: 'card:updated',
  CARD_MOVED: 'card:moved',
  CARD_DELETED: 'card:deleted',
  BOARD_UPDATED: 'board:updated',
  BOARD_DELETED: 'board:deleted',
};
