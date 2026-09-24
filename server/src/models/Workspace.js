import mongoose from 'mongoose';

export const WORKSPACE_ROLES = ['admin', 'member'];

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: WORKSPACE_ROLES, default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, trim: true, maxlength: 280, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: { type: [memberSchema], default: [] },
  },
  { timestamps: true }
);

workspaceSchema.index({ 'members.user': 1 });

workspaceSchema.methods.roleOf = function roleOf(userId) {
  const id = userId.toString();
  if (this.owner.toString() === id) return 'admin';
  const member = this.members.find((m) => (m.user._id || m.user).toString() === id);
  return member ? member.role : null;
};

export default mongoose.model('Workspace', workspaceSchema);
