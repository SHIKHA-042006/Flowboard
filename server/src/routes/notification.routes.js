import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/notification.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', ctrl.listNotifications);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', ctrl.markRead);

export default router;
