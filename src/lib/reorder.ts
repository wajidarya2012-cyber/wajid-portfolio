// Shared ▲/▼ reorder helper for admin list managers (Education, Experience, Skills,
// Gallery, Project Categories, Projects, Settings → Navigation Menu).
//
// Swapping just the two `orderKey` values (the old per-manager pattern) left the
// array's own position order untouched, so a component that renders items by array
// index instead of by the (now out-of-sync) order field never visually reordered —
// see docs/DEBUGGING_GUIDE.md. This helper always returns a brand-new array whose
// *position order* already matches the new ranking, with every item's order field
// renumbered 0..n-1 to match its position — so callers can render the returned list
// directly (no separate sort step) and duplicate/gappy order values can't accumulate.
export interface ReorderOutcome<T> {
  /** Full list, already sorted into its new order, each item's order field renumbered to match. */
  list: T[];
  /** The (at most two) items whose order field actually changed — the only ones that need persisting. */
  changed: T[];
}

export function reorder<T>(
  list: T[],
  orderKey: keyof T,
  isTarget: (item: T) => boolean,
  dir: -1 | 1
): ReorderOutcome<T> | null {
  const sorted = [...list].sort(
    (a, b) => (a[orderKey] as unknown as number) - (b[orderKey] as unknown as number)
  );
  const idx = sorted.findIndex(isTarget);
  if (idx === -1) return null;
  const swapIdx = idx + dir;
  if (swapIdx < 0 || swapIdx >= sorted.length) return null;

  [sorted[idx], sorted[swapIdx]] = [sorted[swapIdx], sorted[idx]];
  const renumbered = sorted.map((item, i) => ({ ...item, [orderKey]: i })) as T[];
  return { list: renumbered, changed: [renumbered[idx], renumbered[swapIdx]] };
}
