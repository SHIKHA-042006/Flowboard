import { z } from 'zod';
import List from '../models/List.js';
import Card from '../models/Card.js';
import { asyncHandler } from '../middleware/error.js';
import { positionForIndex, needsRebalance, rebalance, POSITION_GAP } from '../services/position.js';
import { emitBoard, EVENTS } from '../sockets/emit.js';

export const createListSchema = z.object({
  boardId: z.string().length(24),
  title: z.string().trim().min(1, 'Name your list').max(80),
});

export const updateListSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  archived: z.boolean().optional(),
});

export const moveListSchema = z.object({
  index: z.number().int().min(0),
});

export const createList = asyncHandler(async (req, res) => {
  const last = await List.findOne({ board: req.board._id }).sort({ position: -1 }).select('position');

  const list = await List.create({
    title: req.body.title,
    board: req.board._id,
    position: (last?.position || 0) + POSITION_GAP,
  });

  emitBoard(req, req.board._id, EVENTS.LIST_CREATED, { list });
  res.status(201).json({ list });
});

export const updateList = asyncHandler(async (req, res) => {
  Object.assign(req.list, req.body);
  await req.list.save();
  emitBoard(req, req.board._id, EVENTS.LIST_UPDATED, { list: req.list });
  res.json({ list: req.list });
});

/**
 * The client sends the target index, not a position. The server owns ordering
 * so two people dragging at once cannot write conflicting coordinates.
 */
export const moveList = asyncHandler(async (req, res) => {
  const siblings = await List.find({ board: req.board._id, _id: { $ne: req.list._id }, archived: false })
    .sort({ position: 1 })
    .select('position')
    .lean();

  const positions = siblings.map((s) => s.position);
  req.list.position = positionForIndex(positions, req.body.index);
  await req.list.save();

  if (needsRebalance(positions, req.body.index)) {
    await rebalance(List, { board: req.board._id, archived: false });
  }

  const lists = await List.find({ board: req.board._id, archived: false }).sort({ position: 1 }).lean();
  emitBoard(req, req.board._id, EVENTS.LIST_MOVED, { lists });
  res.json({ lists });
});

export const deleteList = asyncHandler(async (req, res) => {
  await Card.deleteMany({ list: req.list._id });
  await List.deleteOne({ _id: req.list._id });

  emitBoard(req, req.board._id, EVENTS.LIST_DELETED, { listId: req.list._id });
  res.json({ ok: true });
});
