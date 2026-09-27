"use client";

import type { CSSProperties } from "react";
import type { Column, ColumnKey } from "../lib/devices/columns";
import type { DeviceView } from "../lib/devices/use-device-view";

const arrows = { asc: "\u25B2", desc: "\u25BC" };

export function ColumnHeader({
  column,
  view,
  scope,
  options,
}: {
  column: Column;
  view: DeviceView;
  /** Each group repeats the header, so anchors and popovers need unique names. */
  scope: string;
  options: Map<ColumnKey, string[]>;
}) {
  const sorted = view.sort.key === column.key;
  const selected = view.filters[column.key] ?? [];
  const values = options.get(column.key) ?? [];
  const popover = `filter-${scope}-${column.key}`;
  const anchor = `--${popover}`;

  return (
    <th
      scope="col"
      aria-sort={
        sorted
          ? view.sort.direction === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex flex-1 items-center gap-1 text-left font-semibold"
          onClick={() => view.toggleSort(column.key)}
        >
          {column.label}
          <span
            aria-hidden="true"
            className={sorted ? "text-primary" : "text-base-content/30"}
          >
            {sorted ? arrows[view.sort.direction] : arrows.asc}
          </span>
          <span className="sr-only">
            {sorted
              ? `Sorted ${view.sort.direction === "asc" ? "A to Z" : "Z to A"}. Reverse this column.`
              : `Sort by ${column.label}`}
          </span>
        </button>
        {/* The popover API draws the menu in the top layer, so table scrolling
            never clips it and opening one menu closes any other. */}
        <button
          type="button"
          popoverTarget={popover}
          style={{ anchorName: anchor } as CSSProperties}
          className={`btn btn-ghost btn-xs ${selected.length ? "text-primary" : "text-base-content/40"}`}
        >
          <span aria-hidden="true">{"\u2261"}</span>
          <span className="sr-only">Filter by {column.label}</span>
          {selected.length > 0 && (
            <span className="badge badge-primary badge-xs">
              {selected.length}
            </span>
          )}
        </button>
        <ul
          id={popover}
          popover="auto"
          style={{ positionAnchor: anchor } as CSSProperties}
          className="dropdown dropdown-end menu max-h-72 w-56 flex-nowrap overflow-y-auto rounded-box bg-base-100 shadow"
        >
          <li className="menu-title">{column.label}</li>
          {values.map((value) => (
            <li key={value}>
              <label>
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={selected.includes(value)}
                  onChange={() => view.toggleFilter(column.key, value)}
                />
                <span className="truncate">{value}</span>
              </label>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => view.clearFilter(column.key)}
              disabled={selected.length === 0}
            >
              Clear this filter
            </button>
          </li>
        </ul>
      </div>
    </th>
  );
}
