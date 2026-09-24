import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/auth.controller.js';

const router = Router();

// Credential endpoints are the ones worth throttling.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: { message: 'Too many attempts. Try again in a few minutes.' } },
});

router.post('/register', authLimiter, validate({ body: ctrl.registerSchema }), ctrl.register);
router.post('/login', authLimiter, validate({ body: ctrl.loginSchema }), ctrl.login);
router.post('/logout', requireAuth, ctrl.logout);
router.get('/me', requireAuth, ctrl.me);
router.patch('/me', requireAuth, validate({ body: ctrl.updateProfileSchema }), ctrl.updateProfile);
router.get('/users', requireAuth, ctrl.searchUsers);

export default router;
