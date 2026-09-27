/**
 * Pure selection-set math for the device table, kept apart from the `use-`
 * hook so shift-click ranges and pruning can be unit tested without React.
 */

export function toggleKey(selected: Set<string>, key: string): Set<string> {
  const next = new Set(selected);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

/** The inclusive span between the anchor and the target, in row order. */
export function rangeBetween(
  keys: string[],
  anchorKey: string | null,
  targetKey: string,
): string[] | null {
  if (!anchorKey) return null;
  const from = keys.indexOf(anchorKey);
  const to = keys.indexOf(targetKey);
  if (from === -1 || to === -1) return null;
  const [start, end] = from < to ? [from, to] : [to, from];
  return keys.slice(start, end + 1);
}

/** A shift-click extends the target's own state across the whole range. */
export function applyRange(
  selected: Set<string>,
  range: string[],
  key: string,
): Set<string> {
  const next = new Set(selected);
  const selecting = !next.has(key);
  for (const item of range) {
    if (selecting) next.add(item);
    else next.delete(item);
  }
  return next;
}

/** The header checkbox clears the set if every row shown is already in it. */
export function toggleAllKeys(
  selected: Set<string>,
  keys: string[],
): Set<string> {
  const all = keys.length > 0 && keys.every((key) => selected.has(key));
  const next = new Set(selected);
  for (const key of keys) {
    if (all) next.delete(key);
    else next.add(key);
  }
  return next;
}

/** A row that leaves the filtered view drops out of the selection. */
export function pruneToVisible(
  selected: Set<string>,
  visibleKeys: Iterable<string>,
): Set<string> {
  const present = new Set(visibleKeys);
  const kept = [...selected].filter((key) => present.has(key));
  return kept.length === selected.size ? selected : new Set(kept);
}

export const allSelected = (selected: Set<string>, keys: string[]) =>
  keys.length > 0 && keys.every((key) => selected.has(key));

export const someSelected = (selected: Set<string>, keys: string[]) =>
  keys.some((key) => selected.has(key)) && !allSelected(selected, keys);
