/** Mirrors the server's ordering maths so optimistic moves land in the right slot. */
export const POSITION_GAP = 1024;

export function positionForIndex(sorted, index) {
  const i = Math.max(0, Math.min(index, sorted.length));
  const before = i > 0 ? sorted[i - 1] : null;
  const after = i < sorted.length ? sorted[i] : null;
  if (before == null && after == null) return POSITION_GAP;
  if (before == null) return after - POSITION_GAP;
  if (after == null) return before + POSITION_GAP;
  return (before + after) / 2;
}
