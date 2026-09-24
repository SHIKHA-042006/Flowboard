import mongoose from 'mongoose';

export const BOARD_BACKGROUNDS = ['slate', 'teal', 'indigo', 'amber', 'rose', 'forest'];

export const DEFAULT_LABELS = [
  { name: 'Bug', color: '#DC2626' },
  { name: 'Feature', color: '#0D9488' },
  { name: 'Design', color: '#7C3AED' },
  { name: 'Urgent', color: '#EA580C' },
  { name: 'Docs', color: '#2563EB' },
];

// Labels live on the board and cards reference them by id, so renaming a label
// updates every card at once.
const labelSchema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 30, default: '' },
  color: { type: String, required: true },
});

const boardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    background: { type: String, enum: BOARD_BACKGROUNDS, default: 'slate' },
    // Optional photographic backdrop layered over the gradient. Remote URL only —
    // no file storage in this project, so an empty string falls back to the gradient.
    backgroundImage: { type: String, default: '', trim: true },
    labels: { type: [labelSchema], default: () => DEFAULT_LABELS },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    archived: { type: Boolean, default: false },
    description: { type: String, trim: true, maxlength: 280, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Board', boardSchema);
