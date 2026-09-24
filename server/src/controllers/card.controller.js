import { z } from 'zod';
import List from '../models/List.js';
import Card, { CARD_PRIORITIES } from '../models/Card.js';
import { ApiError, asyncHandler } from '../middleware/error.js';
import { positionForIndex, needsRebalance, rebalance, POSITION_GAP } from '../services/position.js';
import { emitBoard, EVENTS } from '../sockets/emit.js';
import { notify } from '../services/notify.js';

const objectId = z.string().length(24);

export const createCardSchema = z.object({
  listId: objectId,
  title: z.string().trim().min(1, 'Give the card a title').max(200),
});

export const updateCardSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  assignees: z.array(objectId).max(20).optional(),
  labels: z.array(objectId).max(20).optional(),
  priority: z.enum(CARD_PRIORITIES).optional(),
  dueDate: z.union([z.string().datetime(), z.null()]).optional(),
  completed: z.boolean().optional(),
});

export const moveCardSchema = z.object({
  listId: objectId,
  index: z.number().int().min(0),
});

export const commentSchema = z.object({
  text: z.string().trim().min(1, 'Write something first').max(2000),
});

export const checklistItemSchema = z.object({
  text: z.string().trim().min(1, 'Write a checklist item').max(240),
});

export const attachmentSchema = z.object({
  name: z.string().trim().min(1, 'Give it a name').max(120),
  url: z.string().trim().url('Enter a valid URL'),
});

const populateCard = (query) =>
  query
    .populate('assignees', 'name email avatarColor')
    .populate('comments.author', 'name email avatarColor')
    .populate('attachments.addedBy', 'name email avatarColor')
    .populate('activity.actor', 'name email avatarColor');

export const getCard = asyncHandler(async (req, res) => {
  const card = await populateCard(Card.findById(req.card._id));
  res.json({ card });
});

export const createCard = asyncHandler(async (req, res) => {
  const last = await Card.findOne({ list: req.list._id }).sort({ position: -1 }).select('position');

  const card = new Card({
    title: req.body.title,
    list: req.list._id,
    board: req.board._id,
    position: (last?.position || 0) + POSITION_GAP,
    createdBy: req.user._id,
  });
  card.logActivity(req.user._id, 'created', { listTitle: req.list.title });
  await card.save();

  emitBoard(req, req.board._id, EVENTS.CARD_CREATED, { card });
  res.status(201).json({ card });
});

export const updateCard = asyncHandler(async (req, res) => {
  const { assignees, labels, ...rest } = req.body;
  const newlyAssigned = [];

  if (assignees) {
    // Only workspace members can be assigned.
    const memberIds = req.workspace.members.map((m) => (m.user._id || m.user).toString());
    if (assignees.some((id) => !memberIds.includes(id))) {
      throw ApiError.badRequest('You can only assign people in this workspace');
    }
    const before = req.card.assignees.map((id) => id.toString());
    newlyAssigned.push(...assignees.filter((id) => !before.includes(id)));
    req.card.assignees = assignees;
    if (newlyAssigned.length) {
      req.card.logActivity(req.user._id, 'assigned', { userIds: newlyAssigned });
    }
  }

  if (labels) {
    req.card.labels = labels;
  }

  if (rest.completed !== undefined && rest.completed !== req.card.completed) {
    req.card.logActivity(req.user._id, rest.completed ? 'completed' : 'reopened', {});
  }
  if (rest.dueDate !== undefined && String(rest.dueDate) !== String(req.card.dueDate)) {
    req.card.logActivity(req.user._id, 'due_date_changed', { dueDate: rest.dueDate });
  }
  if (rest.title && rest.title !== req.card.title) {
    req.card.logActivity(req.user._id, 'renamed', { from: req.card.title, to: rest.title });
  }

  Object.assign(req.card, rest);
  await req.card.save();

  const card = await populateCard(Card.findById(req.card._id));
  emitBoard(req, req.board._id, EVENTS.CARD_UPDATED, { card });

  await Promise.all(
    newlyAssigned.map((userId) =>
      notify(req, {
        userId,
        actorId: req.user._id,
        type: 'card_assigned',
        message: `${req.user.name} assigned you to "${card.title}"`,
        boardId: req.board._id,
        cardId: card._id,
      })
    )
  );

  res.json({ card });
});

/** Move within a list or across lists; the server computes the new position. */
export const moveCard = asyncHandler(async (req, res) => {
  const { listId, index } = req.body;

  const targetList = await List.findById(listId);
  if (!targetList) throw ApiError.notFound('List not found');
  if (!targetList.board.equals(req.board._id)) {
    throw ApiError.badRequest('Cards can only move within the same board');
  }

  const fromListId = req.card.list.toString();
  const fromList = await List.findById(fromListId).select('title');

  const siblings = await Card.find({ list: targetList._id, _id: { $ne: req.card._id } })
    .sort({ position: 1 })
    .select('position')
    .lean();

  const positions = siblings.map((s) => s.position);
  req.card.list = targetList._id;
  req.card.position = positionForIndex(positions, index);

  if (fromListId !== listId) {
    req.card.logActivity(req.user._id, 'moved', { from: fromList?.title, to: targetList.title });
  }
  await req.card.save();

  if (needsRebalance(positions, index)) {
    await rebalance(Card, { list: targetList._id });
  }

  const card = await populateCard(Card.findById(req.card._id));
  emitBoard(req, req.board._id, EVENTS.CARD_MOVED, { card, fromListId, toListId: listId, index });
  res.json({ card, fromListId });
});

export const deleteCard = asyncHandler(async (req, res) => {
  await Card.deleteOne({ _id: req.card._id });
  emitBoard(req, req.board._id, EVENTS.CARD_DELETED, {
    cardId: req.card._id,
    listId: req.card.list,
  });
  res.json({ ok: true });
});

export const addComment = asyncHandler(async (req, res) => {
  req.card.comments.push({ author: req.user._id, text: req.body.text });
  req.card.logActivity(req.user._id, 'commented', { preview: req.body.text.slice(0, 80) });
  await req.card.save();

  const card = await populateCard(Card.findById(req.card._id));
  emitBoard(req, req.board._id, EVENTS.CARD_UPDATED, { card });

  await Promise.all(
    (card.assignees || [])
      .map((a) => a._id)
      .filter((id) => !id.equals(req.user._id))
      .map((userId) =>
        notify(req, {
          userId,
          actorId: req.user._id,
          type: 'card_comment',
          message: `${req.user.name} commented on "${card.title}"`,
          boardId: req.board._id,
          cardId: card._id,
        })
      )
  );

  res.status(201).json({ card });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = req.card.comments.id(req.params.commentId);
  if (!comment) throw ApiError.notFound('Comment not found');
  if (!comment.author.equals(req.user._id) && req.role !== 'admin') {
    throw ApiError.forbidden('You can only delete your own comments');
  }

  comment.deleteOne();
  await req.card.save();

  const card = await populateCard(Card.findById(req.card._id));
  emitBoard(req, req.board._id, EVENTS.CARD_UPDATED, { card });
  res.json({ card });
});

// --- Checklist ---------------------------------------------------------

export const addChecklistItem = asyncHandler(async (req, res) => {
  req.card.checklist.push({ text: req.body.text });
  await req.card.save();
  const card = await populateCard(Card.findById(req.card._id));
  emitBoard(req, req.board._id, EVENTS.CARD_UPDATED, { card });
  res.status(201).json({ card });
});

export const toggleChecklistItem = asyncHandler(async (req, res) => {
  const item = req.card.checklist.id(req.params.itemId);
  if (!item) throw ApiError.notFound('Checklist item not found');
  item.done = !item.done;
  await req.card.save();
  const card = await populateCard(Card.findById(req.card._id));
  emitBoard(req, req.board._id, EVENTS.CARD_UPDATED, { card });
  res.json({ card });
});

export const deleteChecklistItem = asyncHandler(async (req, res) => {
  const item = req.card.checklist.id(req.params.itemId);
  if (!item) throw ApiError.notFound('Checklist item not found');
  item.deleteOne();
  await req.card.save();
  const card = await populateCard(Card.findById(req.card._id));
  emitBoard(req, req.board._id, EVENTS.CARD_UPDATED, { card });
  res.json({ card });
});

// --- Attachments ---------------------------------------------------------

export const addAttachment = asyncHandler(async (req, res) => {
  req.card.attachments.push({ ...req.body, addedBy: req.user._id });
  req.card.logActivity(req.user._id, 'attached', { name: req.body.name });
  await req.card.save();
  const card = await populateCard(Card.findById(req.card._id));
  emitBoard(req, req.board._id, EVENTS.CARD_UPDATED, { card });
  res.status(201).json({ card });
});

export const deleteAttachment = asyncHandler(async (req, res) => {
  const attachment = req.card.attachments.id(req.params.attachmentId);
  if (!attachment) throw ApiError.notFound('Attachment not found');
  attachment.deleteOne();
  await req.card.save();
  const card = await populateCard(Card.findById(req.card._id));
  emitBoard(req, req.board._id, EVENTS.CARD_UPDATED, { card });
  res.json({ card });
});
