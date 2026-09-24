import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { ApiError, asyncHandler } from './error.js';

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

/** Requires a valid `Authorization: Bearer <token>` header. */
export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Your session expired. Sign in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('Account no longer exists');

  req.user = user;
  // The client sends its socket id so we can skip echoing events back to the
  // tab that made the change (it already applied the update optimistically).
  req.socketId = req.headers['x-socket-id'] || null;
  next();
});
