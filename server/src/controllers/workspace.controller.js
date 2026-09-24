import { z } from 'zod';
import mongoose from 'mongoose';
import Workspace, { WORKSPACE_ROLES } from '../models/Workspace.js';
import Board from '../models/Board.js';
import List from '../models/List.js';
import Card from '../models/Card.js';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../middleware/error.js';

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2, 'Name your workspace').max(60),
  description: z.string().trim().max(280).optional().default(''),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

export const addMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  role: z.enum(WORKSPACE_ROLES).default('member'),
});

export const listWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ 'members.user': req.user._id })
    .populate('members.user', 'name email avatarColor')
    .sort({ createdAt: 1 })
    .lean();

  const ids = workspaces.map((w) => w._id);
  const boards = await Board.find({ workspace: { $in: ids }, archived: false })
    .sort({ updatedAt: -1 })
    .lean();

  res.json({
    workspaces: workspaces.map((w) => ({
      ...w,
      boards: boards.filter((b) => b.workspace.toString() === w._id.toString()),
    })),
  });
});

export const getWorkspace = asyncHandler(async (req, res) => {
  const boards = await Board.find({ workspace: req.workspace._id, archived: false })
    .sort({ updatedAt: -1 })
    .lean();

  const starredIds = new Set((req.user.starredBoards || []).map((id) => id.toString()));
  const annotated = boards.map((b) => ({ ...b, starred: starredIds.has(b._id.toString()) }));

  res.json({ workspace: req.workspace, boards: annotated, role: req.role });
});

/** Cross-board activity feed for everything happening in this one workspace. */
export const getWorkspaceActivity = asyncHandler(async (req, res) => {
  const boards = await Board.find({ workspace: req.workspace._id, archived: false }).select('_id title');
  const boardById = Object.fromEntries(boards.map((b) => [b._id.toString(), b.title]));

  const recentCards = await Card.find({ board: { $in: boards.map((b) => b._id) } })
    .sort({ updatedAt: -1 })
    .limit(30)
    .select('title board activity')
    .populate('activity.actor', 'name email avatarColor')
    .lean();

  const activity = recentCards
    .flatMap((c) =>
      (c.activity || []).slice(0, 1).map((a) => ({
        ...a,
        cardId: c._id,
        cardTitle: c.title,
        boardId: c.board,
        boardTitle: boardById[c.board.toString()],
      }))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 15);

  res.json({ activity });
});

export const createWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.create({
    ...req.body,
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'admin' }],
  });
  await workspace.populate('members.user', 'name email avatarColor');
  res.status(201).json({ workspace });
});

export const updateWorkspace = asyncHandler(async (req, res) => {
  Object.assign(req.workspace, req.body);
  await req.workspace.save();
  res.json({ workspace: req.workspace });
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  if (!req.workspace.owner.equals(req.user._id)) {
    throw ApiError.forbidden('Only the owner can delete a workspace');
  }

  const boards = await Board.find({ workspace: req.workspace._id }).select('_id');
  const boardIds = boards.map((b) => b._id);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Card.deleteMany({ board: { $in: boardIds } }).session(session);
      await List.deleteMany({ board: { $in: boardIds } }).session(session);
      await Board.deleteMany({ _id: { $in: boardIds } }).session(session);
      await Workspace.deleteOne({ _id: req.workspace._id }).session(session);
    });
  } catch {
    // Standalone mongod has no transactions; fall back to sequential deletes.
    await Card.deleteMany({ board: { $in: boardIds } });
    await List.deleteMany({ board: { $in: boardIds } });
    await Board.deleteMany({ _id: { $in: boardIds } });
    await Workspace.deleteOne({ _id: req.workspace._id });
  } finally {
    await session.endSession();
  }

  res.json({ ok: true });
});

export const addMember = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw ApiError.notFound('No account uses that email yet');

  if (req.workspace.members.some((m) => (m.user._id || m.user).equals(user._id))) {
    throw ApiError.conflict('They are already in this workspace');
  }

  req.workspace.members.push({ user: user._id, role: req.body.role });
  await req.workspace.save();
  await req.workspace.populate('members.user', 'name email avatarColor');

  res.status(201).json({ workspace: req.workspace });
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (req.workspace.owner.equals(userId)) {
    throw ApiError.badRequest("The owner's role cannot be changed");
  }

  const member = req.workspace.members.find((m) => (m.user._id || m.user).equals(userId));
  if (!member) throw ApiError.notFound('That person is not in this workspace');

  member.role = req.body.role;
  await req.workspace.save();
  await req.workspace.populate('members.user', 'name email avatarColor');

  res.json({ workspace: req.workspace });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (req.workspace.owner.equals(userId)) throw ApiError.badRequest('The owner cannot be removed');

  // Admins can remove anyone; members can only remove themselves (leave).
  if (req.role !== 'admin' && !req.user._id.equals(userId)) {
    throw ApiError.forbidden('Only admins can remove other people');
  }

  req.workspace.members = req.workspace.members.filter(
    (m) => !(m.user._id || m.user).equals(userId)
  );
  await req.workspace.save();

  res.json({ ok: true });
});
