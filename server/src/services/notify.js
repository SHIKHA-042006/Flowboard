import Notification from '../models/Notification.js';
import { userRoom } from '../sockets/index.js';

/**
 * Creates a notification and pushes it over the socket if the recipient is
 * online. `req` is optional — the seed script calls this without one.
 */
export async function notify(req, { userId, actorId, type, message, boardId, cardId }) {
  if (!userId || userId.toString() === actorId?.toString()) return null; // don't notify yourself

  const notification = await Notification.create({
    user: userId,
    actor: actorId,
    type,
    message,
    board: boardId,
    card: cardId,
  });

  const io = req?.app?.get('io');
  if (io) {
    const populated = await notification.populate('actor', 'name email avatarColor');
    io.to(userRoom(userId)).emit('notification:new', populated);
  }

  return notification;
}
