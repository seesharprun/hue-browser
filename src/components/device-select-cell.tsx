"use client";

import type { DeviceRow } from "../lib/devices/types";
import type { Selection } from "../lib/devices/use-selection";

/** The header checkbox selects or clears every row currently shown below it. */
export function SelectAllCheckbox({
  rows,
  title,
  selection,
}: {
  rows: DeviceRow[];
  title: string;
  selection: Selection;
}) {
  return (
    <input
      type="checkbox"
      className="checkbox checkbox-sm"
      checked={selection.allSelected(rows)}
      ref={(element) => {
        if (element) element.indeterminate = selection.someSelected(rows);
      }}
      onChange={() => selection.toggleAll(rows)}
      aria-label={title ? `Select all in ${title}` : "Select all"}
    />
  );
}

/**
 * A plain click toggles one row; shift-click extends the range from the last
 * row clicked. The default toggle is suppressed so the range logic, not the
 * browser, decides the resulting checked state.
 */
export function SelectRowCheckbox({
  row,
  rows,
  selection,
}: {
  row: DeviceRow;
  rows: DeviceRow[];
  selection: Selection;
}) {
  return (
    <input
      type="checkbox"
      className="checkbox checkbox-sm"
      checked={selection.isSelected(row)}
      onChange={() => {}}
      onClick={(event) => {
        event.preventDefault();
        selection.toggleRow(row, rows, event.shiftKey);
      }}
      aria-label={`Select ${row.name}`}
    />
  );
}
