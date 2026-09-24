import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Board from '../models/Board.js';
import Workspace from '../models/Workspace.js';

export const boardRoom = (boardId) => `board:${boardId}`;
export const userRoom = (userId) => `user:${userId}`;

/** Who is currently viewing which board, for the presence avatars. */
const presence = new Map(); // boardId -> Map(userId -> user)

function presenceList(boardId) {
  return Array.from(presence.get(boardId)?.values() || []);
}

export function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.clientUrls, credentials: true },
  });

  // Same JWT as the REST API, passed through the socket handshake.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Missing auth token'));
      const payload = verifyToken(token);
      const user = await User.findById(payload.sub);
      if (!user) return next(new Error('Invalid token'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // A personal room so notifications reach a user regardless of which
    // board (if any) they currently have open.
    socket.join(userRoom(socket.user._id));

    socket.on('board:join', async (boardId, ack) => {
      try {
        const board = await Board.findById(boardId);
        if (!board) return ack?.({ ok: false, error: 'Board not found' });

        // Rooms are access-controlled too, otherwise anyone could listen in.
        const workspace = await Workspace.findById(board.workspace);
        if (!workspace?.roleOf(socket.user._id)) {
          return ack?.({ ok: false, error: 'Forbidden' });
        }

        socket.join(boardRoom(boardId));
        socket.data.boardId = boardId;

        if (!presence.has(boardId)) presence.set(boardId, new Map());
        presence.get(boardId).set(socket.user._id.toString(), socket.user.toJSON());

        io.to(boardRoom(boardId)).emit('presence:update', presenceList(boardId));
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on('board:leave', (boardId) => leaveBoard(io, socket, boardId));
    socket.on('disconnect', () => leaveBoard(io, socket, socket.data.boardId));
  });

  return io;
}

function leaveBoard(io, socket, boardId) {
  if (!boardId) return;
  socket.leave(boardRoom(boardId));

  const room = presence.get(boardId);
  if (!room) return;

  // Only drop the user if they have no other tab open on this board.
  const stillHere = Array.from(io.sockets.sockets.values()).some(
    (s) => s.id !== socket.id && s.data.boardId === boardId && s.user?._id.equals(socket.user._id)
  );
  if (!stillHere) room.delete(socket.user._id.toString());

  io.to(boardRoom(boardId)).emit('presence:update', Array.from(room.values()));
}
