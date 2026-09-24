import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loadCard, loadListFromBody } from '../middleware/access.js';
import * as ctrl from '../controllers/card.controller.js';

const router = Router();
router.use(requireAuth);

router.post('/', validate({ body: ctrl.createCardSchema }), loadListFromBody('listId'), ctrl.createCard);

router.get('/:id', loadCard(), ctrl.getCard);
router.patch('/:id', loadCard(), validate({ body: ctrl.updateCardSchema }), ctrl.updateCard);
router.patch('/:id/move', loadCard(), validate({ body: ctrl.moveCardSchema }), ctrl.moveCard);
router.delete('/:id', loadCard(), ctrl.deleteCard);

router.post('/:id/comments', loadCard(), validate({ body: ctrl.commentSchema }), ctrl.addComment);
router.delete('/:id/comments/:commentId', loadCard(), ctrl.deleteComment);

router.post('/:id/checklist', loadCard(), validate({ body: ctrl.checklistItemSchema }), ctrl.addChecklistItem);
router.patch('/:id/checklist/:itemId/toggle', loadCard(), ctrl.toggleChecklistItem);
router.delete('/:id/checklist/:itemId', loadCard(), ctrl.deleteChecklistItem);

router.post('/:id/attachments', loadCard(), validate({ body: ctrl.attachmentSchema }), ctrl.addAttachment);
router.delete('/:id/attachments/:attachmentId', loadCard(), ctrl.deleteAttachment);

export default router;
