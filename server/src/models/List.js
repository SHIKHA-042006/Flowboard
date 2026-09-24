import mongoose from 'mongoose';

const listSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    // Sparse float ordering: inserting between two neighbours is one write.
    position: { type: Number, required: true },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

listSchema.index({ board: 1, position: 1 });

export default mongoose.model('List', listSchema);
