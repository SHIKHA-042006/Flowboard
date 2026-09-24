import Workspace from '../models/Workspace.js';
import Board from '../models/Board.js';
import Card from '../models/Card.js';
import { asyncHandler } from '../middleware/error.js';

/**
 * Everything the dashboard needs in one round trip: starred/recent boards,
 * cards assigned to the user, cards due soon, and a cross-board activity feed
 * — all scoped to boards the user can actually see.
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ 'members.user': req.user._id }).select('_id name');
  const workspaceIds = workspaces.map((w) => w._id);
  const workspaceName = Object.fromEntries(workspaces.map((w) => [w._id.toString(), w.name]));

  const boards = await Board.find({ workspace: { $in: workspaceIds }, archived: false }).lean();
  const boardIds = boards.map((b) => b._id);
  const boardById = Object.fromEntries(boards.map((b) => [b._id.toString(), b]));

  const withWorkspaceName = (b) => ({ ...b, workspaceName: workspaceName[b.workspace.toString()] });

  const starredBoards = (req.user.starredBoards || [])
    .map((id) => boardById[id.toString()])
    .filter(Boolean)
    .map(withWorkspaceName);

  const recentBoards = (req.user.recentBoards || [])
    .map((id) => boardById[id.toString()])
    .filter(Boolean)
    .map(withWorkspaceName);

  const assignedCards = await Card.find({ board: { $in: boardIds }, assignees: req.user._id, completed: false })
    .sort({ dueDate: 1, createdAt: -1 })
    .limit(12)
    .populate('assignees', 'name email avatarColor')
    .lean();

  const upcoming = await Card.find({
    board: { $in: boardIds },
    dueDate: { $ne: null },
    completed: false,
  })
    .sort({ dueDate: 1 })
    .limit(8)
    .populate('assignees', 'name email avatarColor')
    .lean();

  // Cross-board activity feed: pull the newest activity entry from each of the
  // most recently updated cards, then take the freshest N overall.
  const recentCards = await Card.find({ board: { $in: boardIds } })
    .sort({ updatedAt: -1 })
    .limit(40)
    .select('title board list activity')
    .populate('activity.actor', 'name email avatarColor')
    .lean();

  const activity = recentCards
    .flatMap((c) =>
      (c.activity || []).slice(0, 1).map((a) => ({
        ...a,
        cardId: c._id,
        cardTitle: c.title,
        boardId: c.board,
        boardTitle: boardById[c.board.toString()]?.title,
      }))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 15);

  const annotate = (c) => ({ ...c, boardTitle: boardById[c.board.toString()]?.title });

  res.json({
    stats: {
      workspaces: workspaces.length,
      boards: boards.length,
      assigned: assignedCards.length,
    },
    starredBoards,
    recentBoards,
    assignedCards: assignedCards.map(annotate),
    upcoming: upcoming.map(annotate),
    activity,
  });
});

/** All cards assigned to the current user, across every board they can see. */
export const getMyTasks = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ 'members.user': req.user._id }).select('_id');
  const boards = await Board.find({ workspace: { $in: workspaces.map((w) => w._id) }, archived: false }).lean();
  const boardIds = boards.map((b) => b._id);
  const boardById = Object.fromEntries(boards.map((b) => [b._id.toString(), b]));

  const cards = await Card.find({ board: { $in: boardIds }, assignees: req.user._id })
    .sort({ completed: 1, dueDate: 1, createdAt: -1 })
    .populate('assignees', 'name email avatarColor')
    .lean();

  res.json({ cards: cards.map((c) => ({ ...c, boardTitle: boardById[c.board.toString()]?.title })) });
});
