"use client";

import type { Column } from "../lib/devices/columns";
import type { DeviceRow } from "../lib/devices/types";
import type { DeviceView } from "../lib/devices/use-device-view";

export function DeviceCell({
  column,
  row,
  view,
}: {
  column: Column;
  row: DeviceRow;
  view: DeviceView;
}) {
  if (!column.chips) return column.display(row);
  const target = column.key === "zones" ? "zones" : "room";
  return (
    <span className="flex flex-wrap gap-1">
      {column.chips(row).map((value) => (
        <button
          key={value}
          type="button"
          className="badge badge-soft badge-primary badge-sm cursor-pointer"
          onClick={() => view.focusGroup(target, value)}
        >
          {value}
          <span className="sr-only">
            Show the {value} {target === "zones" ? "zone" : "room"}
          </span>
        </button>
      ))}
    </span>
  );
}
