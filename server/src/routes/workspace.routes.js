import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loadWorkspace, requireRole } from '../middleware/access.js';
import { WORKSPACE_ROLES } from '../models/Workspace.js';
import * as ctrl from '../controllers/workspace.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', ctrl.listWorkspaces);
router.post('/', validate({ body: ctrl.createWorkspaceSchema }), ctrl.createWorkspace);

router.get('/:id', loadWorkspace(), ctrl.getWorkspace);
router.get('/:id/activity', loadWorkspace(), ctrl.getWorkspaceActivity);
router.patch('/:id', loadWorkspace(), requireRole('admin'), validate({ body: ctrl.updateWorkspaceSchema }), ctrl.updateWorkspace);
router.delete('/:id', loadWorkspace(), requireRole('admin'), ctrl.deleteWorkspace);

router.post('/:id/members', loadWorkspace(), requireRole('admin'), validate({ body: ctrl.addMemberSchema }), ctrl.addMember);
router.patch(
  '/:id/members/:userId',
  loadWorkspace(),
  requireRole('admin'),
  validate({ body: z.object({ role: z.enum(WORKSPACE_ROLES) }) }),
  ctrl.updateMemberRole
);
router.delete('/:id/members/:userId', loadWorkspace(), ctrl.removeMember);

export default router;
