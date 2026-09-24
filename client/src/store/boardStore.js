import { create } from 'zustand';
import { positionForIndex } from '../lib/position.js';

/**
 * A single flat store per board: `lists` and `cards` are plain arrays ordered by
 * `position`. Both user actions and incoming socket events funnel through the
 * same reducers, so a local edit and a remote edit take identical code paths.
 */
const initial = {
  board: null,
  workspace: null,
  lists: [],
  cards: [],
  members: [],
  role: null,
  presence: [],
  starred: false,
  status: 'idle', // idle | loading | ready | error
  error: null,
};

const bySeq = (a, b) => a.position - b.position;

export const useBoardStore = create((set, get) => ({
  ...initial,

  reset: () => set({ ...initial }),
  setStatus: (status, error = null) => set({ status, error }),

  hydrate: (data) =>
    set({
      board: data.board,
      workspace: data.workspace,
      lists: [...data.lists].sort(bySeq),
      cards: [...data.cards].sort(bySeq),
      members: data.members,
      role: data.role,
      starred: !!data.starred,
      status: 'ready',
      error: null,
    }),

  setBoard: (board) => set({ board }),
  setPresence: (presence) => set({ presence }),
  setStarred: (starred) => set({ starred }),

  setLists: (lists) => set({ lists: [...lists].sort(bySeq) }),
  upsertList: (list) =>
    set((s) => {
      const exists = s.lists.some((l) => l._id === list._id);
      const lists = exists ? s.lists.map((l) => (l._id === list._id ? { ...l, ...list } : l)) : [...s.lists, list];
      return { lists: lists.sort(bySeq) };
    }),
  removeList: (listId) =>
    set((s) => ({
      lists: s.lists.filter((l) => l._id !== listId),
      cards: s.cards.filter((c) => c.list !== listId),
    })),

  upsertCard: (card) =>
    set((s) => {
      const exists = s.cards.some((c) => c._id === card._id);
      const cards = exists ? s.cards.map((c) => (c._id === card._id ? { ...c, ...card } : c)) : [...s.cards, card];
      return { cards: cards.sort(bySeq) };
    }),
  removeCard: (cardId) => set((s) => ({ cards: s.cards.filter((c) => c._id !== cardId) })),

  /**
   * Optimistic move: recompute the card's position locally using the same
   * midpoint rule the server uses, so the UI never waits on the network.
   * Returns a snapshot the caller can restore if the request fails.
   */
  moveCardLocal: (cardId, toListId, index) => {
    const snapshot = get().cards;
    const card = snapshot.find((c) => c._id === cardId);
    if (!card) return snapshot;

    const siblings = snapshot
      .filter((c) => c.list === toListId && c._id !== cardId)
      .sort(bySeq)
      .map((c) => c.position);

    const position = positionForIndex(siblings, index);
    set({
      cards: snapshot
        .map((c) => (c._id === cardId ? { ...c, list: toListId, position } : c))
        .sort(bySeq),
    });
    return snapshot;
  },

  moveListLocal: (listId, index) => {
    const snapshot = get().lists;
    const siblings = snapshot.filter((l) => l._id !== listId).map((l) => l.position);
    const position = positionForIndex(siblings, index);
    set({ lists: snapshot.map((l) => (l._id === listId ? { ...l, position } : l)).sort(bySeq) });
    return snapshot;
  },

  restoreCards: (cards) => set({ cards }),
  restoreLists: (lists) => set({ lists }),
}));

/** Cards for one list, ordered, with the active filter applied. */
export const selectCards = (cards, listId, filter) =>
  cards
    .filter((c) => c.list === listId)
    .filter((c) => matchesFilter(c, filter))
    .sort(bySeq);

export function matchesFilter(card, filter) {
  if (!filter) return true;
  const { text, labelId, memberId, dueSoon, status, priority } = filter;

  if (text) {
    const needle = text.toLowerCase();
    const haystack = `${card.title} ${card.description || ''}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  if (labelId && !(card.labels || []).includes(labelId)) return false;
  if (memberId && !(card.assignees || []).some((a) => (a._id || a) === memberId)) return false;
  if (dueSoon && !card.dueDate) return false;
  if (status === 'completed' && !card.completed) return false;
  if (status === 'active' && card.completed) return false;
  if (priority && card.priority !== priority) return false;
  return true;
}
