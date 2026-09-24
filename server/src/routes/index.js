import { Router } from 'express';
import authRoutes from './auth.routes.js';
import workspaceRoutes from './workspace.routes.js';
import boardRoutes from './board.routes.js';
import listRoutes from './list.routes.js';
import cardRoutes from './card.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import searchRoutes from './search.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));
router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/boards', boardRoutes);
router.use('/lists', listRoutes);
router.use('/cards', cardRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/search', searchRoutes);
router.use('/notifications', notificationRoutes);

export default router;
