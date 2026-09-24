import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loadBoard, loadWorkspace } from '../middleware/access.js';
import Workspace from '../models/Workspace.js';
import { ApiError, asyncHandler } from '../middleware/error.js';
import * as ctrl from '../controllers/board.controller.js';

const router = Router();
router.use(requireAuth);

// Creating a board needs the workspace from the body, so resolve it here.
const loadWorkspaceFromBody = asyncHandler(async (req, res, next) => {
  const workspace = await Workspace.findById(req.body.workspaceId).populate('members.user', 'name email avatarColor');
  if (!workspace) throw ApiError.notFound('Workspace not found');
  const role = workspace.roleOf(req.user._id);
  if (!role) throw ApiError.forbidden('You are not a member of this workspace');
  req.workspace = workspace;
  req.role = role;
  next();
});

router.post('/', validate({ body: ctrl.createBoardSchema }), loadWorkspaceFromBody, ctrl.createBoard);

router.get('/:id', loadBoard(), ctrl.getBoard);
router.patch('/:id', loadBoard(), validate({ body: ctrl.updateBoardSchema }), ctrl.updateBoard);
router.delete('/:id', loadBoard(), ctrl.deleteBoard);
router.post('/:id/star', loadBoard(), ctrl.toggleStar);

router.post('/:id/labels', loadBoard(), validate({ body: ctrl.labelSchema }), ctrl.addLabel);
router.patch('/:id/labels/:labelId', loadBoard(), validate({ body: ctrl.labelSchema.partial() }), ctrl.updateLabel);
router.delete('/:id/labels/:labelId', loadBoard(), ctrl.deleteLabel);

export default router;
