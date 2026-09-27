import { type ColumnKey, columns, searchText, UNASSIGNED } from "./columns.ts";
import type { DeviceRow } from "./types";

export type Filters = Partial<Record<ColumnKey, string[]>>;

export const compare = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

/** "Unassigned" groups sort last so named rooms and zones lead the dashboard. */
export function groupOrder(a: string, b: string) {
  if (a === UNASSIGNED) return b === UNASSIGNED ? 0 : 1;
  if (b === UNASSIGNED) return -1;
  return compare(a, b);
}

/** Anchors and scroll targets need an identifier a room or zone name cannot break. */
export const groupId = (value: string) => {
  const safe = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `group-${safe || "all"}`;
};

/** `exclude` leaves one column unfiltered so its own menu keeps every choice. */
export function matches(
  row: DeviceRow,
  term: string,
  filters: Filters,
  exclude?: ColumnKey,
) {
  if (term && !searchText(row).includes(term.toLowerCase())) return false;
  return columns.every((item) => {
    const selected = filters[item.key];
    if (item.key === exclude || !selected?.length) return true;
    return item.values(row).some((value) => selected.includes(value));
  });
}

/** Menu choices come from the rows a group actually holds, so empty values never appear. */
export function facets(rows: DeviceRow[], term: string, filters: Filters) {
  const found = new Map<ColumnKey, string[]>();
  for (const item of columns) {
    const values = new Set<string>();
    for (const row of rows) {
      if (!matches(row, term, filters, item.key)) continue;
      for (const value of item.values(row)) values.add(value);
    }
    found.set(item.key, [...values].sort(compare));
  }
  return found;
}
