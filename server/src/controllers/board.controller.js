import { z } from 'zod';
import Board, { BOARD_BACKGROUNDS } from '../models/Board.js';
import List from '../models/List.js';
import Card from '../models/Card.js';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../middleware/error.js';
import { emitBoard, EVENTS } from '../sockets/emit.js';

export const createBoardSchema = z.object({
  workspaceId: z.string().length(24, 'Pick a workspace'),
  title: z.string().trim().min(1, 'Name your board').max(80),
  background: z.enum(BOARD_BACKGROUNDS).default('slate'),
});

export const updateBoardSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(280).optional(),
  background: z.enum(BOARD_BACKGROUNDS).optional(),
  backgroundImage: z.string().trim().max(500).optional(),
  archived: z.boolean().optional(),
});

export const labelSchema = z.object({
  name: z.string().trim().max(30).default(''),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Pick a colour'),
});

/**
 * One request hydrates the whole board (board + lists + cards). Boards are
 * bounded in size, so this is far cheaper than a waterfall of requests and it
 * gives the client a single consistent snapshot to attach socket events to.
 */
export const getBoard = asyncHandler(async (req, res) => {
  const [lists, cards] = await Promise.all([
    List.find({ board: req.board._id, archived: false }).sort({ position: 1 }).lean(),
    Card.find({ board: req.board._id })
      .sort({ position: 1 })
      .populate('assignees', 'name email avatarColor')
      .populate('comments.author', 'name email avatarColor')
      .populate('attachments.addedBy', 'name email avatarColor')
      .populate('activity.actor', 'name email avatarColor')
      .lean(),
  ]);

  // Track "recently viewed" boards for the sidebar/dashboard, newest first, capped at 10.
  // Fire-and-forget: this shouldn't slow down or fail the board response.
  User.updateOne({ _id: req.user._id }, { $pull: { recentBoards: req.board._id } })
    .then(() =>
      User.updateOne(
        { _id: req.user._id },
        { $push: { recentBoards: { $each: [req.board._id], $position: 0, $slice: 10 } } }
      )
    )
    .catch(() => {});

  res.json({
    board: req.board,
    lists,
    cards,
    members: req.workspace.members,
    workspace: { _id: req.workspace._id, name: req.workspace.name },
    role: req.role,
    starred: (req.user.starredBoards || []).some((id) => id.equals(req.board._id)),
  });
});

/** Toggle this board in the current user's starred list. */
export const toggleStar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const already = user.starredBoards.some((id) => id.equals(req.board._id));

  if (already) {
    user.starredBoards = user.starredBoards.filter((id) => !id.equals(req.board._id));
  } else {
    user.starredBoards.push(req.board._id);
  }
  await user.save();

  res.json({ starred: !already });
});

export const createBoard = asyncHandler(async (req, res) => {
  const board = await Board.create({
    title: req.body.title,
    background: req.body.background,
    workspace: req.workspace._id,
    createdBy: req.user._id,
  });

  // A new board starts with the columns almost every board needs.
  const starters = ['Backlog', 'In progress', 'Done'];
  await List.insertMany(
    starters.map((title, i) => ({ title, board: board._id, position: (i + 1) * 1024 }))
  );

  res.status(201).json({ board });
});

export const updateBoard = asyncHandler(async (req, res) => {
  Object.assign(req.board, req.body);
  await req.board.save();
  emitBoard(req, req.board._id, EVENTS.BOARD_UPDATED, { board: req.board });
  res.json({ board: req.board });
});

export const deleteBoard = asyncHandler(async (req, res) => {
  if (req.role !== 'admin' && !req.board.createdBy.equals(req.user._id)) {
    throw ApiError.forbidden('Only admins or the board creator can delete a board');
  }
  await Card.deleteMany({ board: req.board._id });
  await List.deleteMany({ board: req.board._id });
  await Board.deleteOne({ _id: req.board._id });

  emitBoard(req, req.board._id, EVENTS.BOARD_DELETED, { boardId: req.board._id });
  res.json({ ok: true });
});

export const addLabel = asyncHandler(async (req, res) => {
  req.board.labels.push(req.body);
  await req.board.save();
  emitBoard(req, req.board._id, EVENTS.BOARD_UPDATED, { board: req.board });
  res.status(201).json({ board: req.board });
});

export const updateLabel = asyncHandler(async (req, res) => {
  const label = req.board.labels.id(req.params.labelId);
  if (!label) throw ApiError.notFound('Label not found');
  Object.assign(label, req.body);
  await req.board.save();
  emitBoard(req, req.board._id, EVENTS.BOARD_UPDATED, { board: req.board });
  res.json({ board: req.board });
});

export const deleteLabel = asyncHandler(async (req, res) => {
  const label = req.board.labels.id(req.params.labelId);
  if (!label) throw ApiError.notFound('Label not found');
  label.deleteOne();
  await req.board.save();
  // Detach it from every card that used it.
  await Card.updateMany({ board: req.board._id }, { $pull: { labels: req.params.labelId } });

  emitBoard(req, req.board._id, EVENTS.BOARD_UPDATED, { board: req.board, refetch: true });
  res.json({ board: req.board });
});
