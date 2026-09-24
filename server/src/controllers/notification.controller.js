import Notification from '../models/Notification.js';
import { ApiError, asyncHandler } from '../middleware/error.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate('actor', 'name email avatarColor')
    .lean();

  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ notifications, unreadCount });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) throw ApiError.notFound('Notification not found');
  notification.read = true;
  await notification.save();
  res.json({ notification });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ ok: true });
});
