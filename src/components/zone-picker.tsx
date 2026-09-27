"use client";

import type { CSSProperties } from "react";
import type { GroupOption } from "../lib/devices/types";

/**
 * The popover API keeps the list above the table's scroll container, the same
 * way the row's test menu escapes it.
 */
export function ZonePicker({
  deviceId,
  zones,
  selected,
  allowed,
  disabled,
  onToggle,
}: {
  deviceId: string;
  zones: GroupOption[];
  selected: string[];
  allowed: boolean;
  disabled: boolean;
  onToggle: (id: string) => void;
}) {
  const id = `zones-${deviceId}`;
  const anchor = `--zones-${deviceId}`;
  const chosen = zones.filter((zone) => selected.includes(zone.id));
  const label = chosen.length
    ? chosen.map((zone) => zone.name).join(", ")
    : "None";

  if (!allowed) return <span className="text-base-content/50">&nbsp;</span>;

  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        style={{ anchorName: anchor } as CSSProperties}
        className="btn btn-sm w-full max-w-56 justify-between font-normal"
        disabled={disabled || zones.length === 0}
      >
        <span className="truncate">
          {zones.length === 0 ? "No zones" : label}
        </span>
        <span className="text-base-content/50" aria-hidden="true">
          ▾
        </span>
        <span className="sr-only">Choose zones</span>
      </button>
      <ul
        id={id}
        popover="auto"
        style={
          {
            positionAnchor: anchor,
            positionTryFallbacks: "flip-block",
          } as CSSProperties
        }
        className="dropdown menu max-h-64 w-56 flex-nowrap overflow-y-auto rounded-box border border-base-content/15 bg-base-200 shadow-lg"
      >
        <li className="menu-title">Zones</li>
        {zones.map((zone) => (
          <li key={zone.id}>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={selected.includes(zone.id)}
                onChange={() => onToggle(zone.id)}
              />
              <span className="truncate">{zone.name}</span>
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}
