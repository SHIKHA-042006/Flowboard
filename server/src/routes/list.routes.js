import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loadBoardFromBody, loadList } from '../middleware/access.js';
import * as ctrl from '../controllers/list.controller.js';

const router = Router();
router.use(requireAuth);

router.post('/', validate({ body: ctrl.createListSchema }), loadBoardFromBody('boardId'), ctrl.createList);
router.patch('/:id', loadList(), validate({ body: ctrl.updateListSchema }), ctrl.updateList);
router.patch('/:id/move', loadList(), validate({ body: ctrl.moveListSchema }), ctrl.moveList);
router.delete('/:id', loadList(), ctrl.deleteList);

export default router;
