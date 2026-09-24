import { z } from 'zod';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import { ApiError, asyncHandler } from '../middleware/error.js';
import { signToken } from '../middleware/auth.js';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Use at least 2 characters').max(60),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters').max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) throw ApiError.conflict('That email is already registered');

  const user = await User.create({ name, email, password });

  // Give new accounts somewhere to start.
  await Workspace.create({
    name: `${name.split(' ')[0]}'s workspace`,
    description: 'Your personal workspace',
    owner: user._id,
    members: [{ user: user._id, role: 'admin' }],
  });

  res.status(201).json({ user, token: signToken(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  // Same message either way so the endpoint cannot be used to enumerate emails.
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Email or password is incorrect');
  }

  res.json({ user: user.toJSON(), token: signToken(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  title: z.string().trim().max(80).optional(),
  avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

export const updateProfile = asyncHandler(async (req, res) => {
  Object.assign(req.user, req.body);
  await req.user.save();
  res.json({ user: req.user });
});

// Tokens are stateless, so logout is a client-side token drop. The endpoint
// exists so the client has one place to hook in revocation later.
export const logout = (req, res) => res.json({ ok: true });

export const searchUsers = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json({ users: [] });

  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const users = await User.find({ $or: [{ name: rx }, { email: rx }] }).limit(10);
  res.json({ users });
});
