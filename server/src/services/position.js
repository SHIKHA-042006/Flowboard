/**
 * Ordering strategy
 * -----------------
 * Lists and cards store a float `position`. Moving an item only rewrites that
 * one document (position = midpoint of its new neighbours) instead of
 * renumbering the whole column, which keeps drag/drop to a single write and
 * avoids write storms when several people drag at once.
 *
 * Floats eventually run out of precision after many inserts in the same gap,
 * so when the gap gets too small we rebalance that one column.
 */
export const POSITION_GAP = 1024;
const MIN_GAP = 0.0001;

/** Position for inserting into `sorted` (ascending numbers) at `index`. */
export function positionForIndex(sorted, index) {
  const safeIndex = Math.max(0, Math.min(index, sorted.length));
  const before = safeIndex > 0 ? sorted[safeIndex - 1] : null;
  const after = safeIndex < sorted.length ? sorted[safeIndex] : null;

  if (before == null && after == null) return POSITION_GAP;
  if (before == null) return after - POSITION_GAP;
  if (after == null) return before + POSITION_GAP;
  return (before + after) / 2;
}

export function needsRebalance(sorted, index) {
  const before = index > 0 ? sorted[index - 1] : null;
  const after = index < sorted.length ? sorted[index] : null;
  return before != null && after != null && Math.abs(after - before) < MIN_GAP;
}

/** Rewrites every document in a column with evenly spaced positions. */
export async function rebalance(Model, filter) {
  const docs = await Model.find(filter).sort({ position: 1 }).select('_id');
  await Promise.all(
    docs.map((doc, i) => Model.updateOne({ _id: doc._id }, { position: (i + 1) * POSITION_GAP }))
  );
}
