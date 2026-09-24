import Workspace from '../models/Workspace.js';
import Board from '../models/Board.js';
import List from '../models/List.js';
import Card from '../models/Card.js';
import { ApiError, asyncHandler } from './error.js';

/**
 * Authorisation is resolved from the data, never from the request body:
 * card -> list -> board -> workspace -> membership role.
 * Every write route therefore proves the caller belongs to the workspace.
 */

export const loadWorkspace = (param = 'id') =>
  asyncHandler(async (req, res, next) => {
    const workspace = await Workspace.findById(req.params[param]).populate('members.user', 'name email avatarColor');
    if (!workspace) throw ApiError.notFound('Workspace not found');

    const role = workspace.roleOf(req.user._id);
    if (!role) throw ApiError.forbidden('You are not a member of this workspace');

    req.workspace = workspace;
    req.role = role;
    next();
  });

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.role)) {
    return next(ApiError.forbidden('Only workspace admins can do that'));
  }
  next();
};

export const loadBoard = (param = 'id') =>
  asyncHandler(async (req, res, next) => {
    const board = await Board.findById(req.params[param]);
    if (!board) throw ApiError.notFound('Board not found');
    await attachWorkspace(req, board);
    next();
  });

export const loadList = (param = 'id') =>
  asyncHandler(async (req, res, next) => {
    const list = await List.findById(req.params[param]);
    if (!list) throw ApiError.notFound('List not found');
    const board = await Board.findById(list.board);
    if (!board) throw ApiError.notFound('Board not found');
    req.list = list;
    await attachWorkspace(req, board);
    next();
  });

export const loadCard = (param = 'id') =>
  asyncHandler(async (req, res, next) => {
    const card = await Card.findById(req.params[param]);
    if (!card) throw ApiError.notFound('Card not found');
    const board = await Board.findById(card.board);
    if (!board) throw ApiError.notFound('Board not found');
    req.card = card;
    await attachWorkspace(req, board);
    next();
  });

/** Used by create routes where the parent id arrives in the body. */
export const loadBoardFromBody = (field = 'boardId') =>
  asyncHandler(async (req, res, next) => {
    const board = await Board.findById(req.body[field]);
    if (!board) throw ApiError.notFound('Board not found');
    await attachWorkspace(req, board);
    next();
  });

export const loadListFromBody = (field = 'listId') =>
  asyncHandler(async (req, res, next) => {
    const list = await List.findById(req.body[field]);
    if (!list) throw ApiError.notFound('List not found');
    const board = await Board.findById(list.board);
    if (!board) throw ApiError.notFound('Board not found');
    req.list = list;
    await attachWorkspace(req, board);
    next();
  });

async function attachWorkspace(req, board) {
  const workspace = await Workspace.findById(board.workspace).populate(
    'members.user',
    'name email avatarColor'
  );
  if (!workspace) throw ApiError.notFound('Workspace not found');

  const role = workspace.roleOf(req.user._id);
  if (!role) throw ApiError.forbidden('You do not have access to this board');

  req.board = board;
  req.workspace = workspace;
  req.role = role;
}
