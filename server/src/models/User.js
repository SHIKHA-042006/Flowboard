import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AVATAR_COLORS = ['#0F766E', '#B45309', '#7C3AED', '#BE123C', '#1D4ED8', '#047857'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // `select: false` keeps the hash out of every ordinary query by default.
    password: { type: String, required: true, minlength: 8, select: false },
    avatarColor: {
      type: String,
      default: () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    },
    title: { type: String, trim: true, maxlength: 80, default: '' },
    // Boards this user has starred, independent of who owns/created them.
    starredBoards: { type: [mongoose.Schema.Types.ObjectId], ref: 'Board', default: [] },
    // Most-recently-viewed board ids, newest first, capped in the controller.
    recentBoards: { type: [mongoose.Schema.Types.ObjectId], ref: 'Board', default: [] },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Never leak the hash through res.json()
userSchema.methods.toJSON = function toJSON() {
  const { _id, name, email, avatarColor, title, starredBoards, recentBoards, theme, createdAt } = this.toObject();
  return { _id, name, email, avatarColor, title, starredBoards, recentBoards, theme, createdAt };
};

export default mongoose.model('User', userSchema);
