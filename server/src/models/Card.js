import mongoose from 'mongoose';

export const CARD_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

const checklistItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 240 },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Attachments are link-based (name + URL) rather than uploaded files, since
// this project has no file storage backend.
const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    url: { type: String, required: true, trim: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// A lightweight, append-only trail for the card's "Activity" tab. Kept small
// and structured (type + meta) rather than pre-formatted strings, so the
// client can format it and old entries don't break if copy changes later.
const activitySchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // created | moved | renamed | commented | ...
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const cardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 5000 },
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true, index: true },
    position: { type: Number, required: true },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // References board.labels[]._id
    labels: [{ type: mongoose.Schema.Types.ObjectId }],
    priority: { type: String, enum: CARD_PRIORITIES, default: 'medium' },
    dueDate: { type: Date, default: null },
    completed: { type: Boolean, default: false },
    checklist: { type: [checklistItemSchema], default: [] },
    attachments: { type: [attachmentSchema], default: [] },
    comments: { type: [commentSchema], default: [] },
    activity: { type: [activitySchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

cardSchema.index({ list: 1, position: 1 });
cardSchema.index({ board: 1, title: 'text', description: 'text' });

/** Push an activity entry, capped so a very old card's history stays bounded. */
cardSchema.methods.logActivity = function logActivity(actorId, type, meta = {}) {
  this.activity.unshift({ actor: actorId, type, meta });
  if (this.activity.length > 60) this.activity.length = 60;
};

export default mongoose.model('Card', cardSchema);
