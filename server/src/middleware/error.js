import { isProd } from '../config/env.js';

/** Small typed error so controllers can throw meaningful HTTP failures. */
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
  static badRequest(msg = 'Bad request', details) { return new ApiError(400, msg, details); }
  static unauthorized(msg = 'You need to sign in to do that') { return new ApiError(401, msg); }
  static forbidden(msg = 'You do not have access to this') { return new ApiError(403, msg); }
  static notFound(msg = 'Not found') { return new ApiError(404, msg); }
  static conflict(msg = 'That already exists') { return new ApiError(409, msg); }
}

/** Wraps async controllers so rejected promises reach the error handler. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function notFound(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';
  let details = err.details;

  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}`;
  }
  if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue).join(', ')} is already in use`;
  }
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => e.message);
  }

  if (status >= 500) console.error(err);

  res.status(status).json({
    error: { message, details, ...(isProd ? {} : { stack: err.stack }) },
  });
}
