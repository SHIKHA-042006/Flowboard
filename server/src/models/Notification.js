import mongoose from 'mongoose';

export const NOTIFICATION_TYPES = [
  'card_assigned',
  'card_due_soon',
  'card_comment',
  'card_mentioned',
  'board_invite',
  'workspace_invite',
];

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    message: { type: String, required: true, trim: true, maxlength: 240 },
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
    card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
