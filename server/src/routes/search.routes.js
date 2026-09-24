import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/search.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', ctrl.globalSearch);

export default router;
