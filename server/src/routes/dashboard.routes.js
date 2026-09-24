import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/dashboard.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', ctrl.getDashboard);
router.get('/my-tasks', ctrl.getMyTasks);

export default router;
