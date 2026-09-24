import { ApiError } from './error.js';

/**
 * validate({ body, params, query }) with zod schemas.
 * Parsed (and coerced) output replaces the raw request data, so controllers
 * only ever see clean, typed values.
 */
export const validate = (schemas) => (req, res, next) => {
  try {
    for (const key of ['body', 'params', 'query']) {
      if (schemas[key]) req[key] = schemas[key].parse(req[key]);
    }
    next();
  } catch (err) {
    if (err.issues) {
      return next(
        ApiError.badRequest(
          'Check the highlighted fields',
          err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }))
        )
      );
    }
    next(err);
  }
};
