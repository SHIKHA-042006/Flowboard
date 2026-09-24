import Workspace from '../models/Workspace.js';
import Board from '../models/Board.js';
import Card from '../models/Card.js';
import { asyncHandler } from '../middleware/error.js';

/** Search boards and cards by title, scoped to workspaces the user belongs to. */
export const globalSearch = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json({ boards: [], cards: [] });

  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const workspaces = await Workspace.find({ 'members.user': req.user._id }).select('_id name');
  const workspaceIds = workspaces.map((w) => w._id);
  const workspaceName = Object.fromEntries(workspaces.map((w) => [w._id.toString(), w.name]));

  const boards = await Board.find({ workspace: { $in: workspaceIds }, title: rx, archived: false })
    .limit(8)
    .lean();

  const boardIds = boards.length
    ? boards.map((b) => b._id)
    : (await Board.find({ workspace: { $in: workspaceIds }, archived: false }).select('_id')).map((b) => b._id);

  const cards = await Card.find({ board: { $in: boardIds }, title: rx })
    .limit(10)
    .populate('assignees', 'name email avatarColor')
    .lean();

  const boardTitleById = Object.fromEntries(
    (await Board.find({ _id: { $in: cards.map((c) => c.board) } }).select('title')).map((b) => [
      b._id.toString(),
      b.title,
    ])
  );

  res.json({
    boards: boards.map((b) => ({ ...b, workspaceName: workspaceName[b.workspace.toString()] })),
    cards: cards.map((c) => ({ ...c, boardTitle: boardTitleById[c.board.toString()] })),
  });
});
