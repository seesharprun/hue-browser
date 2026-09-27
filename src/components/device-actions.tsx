"use client";

import type { CSSProperties } from "react";
import { COLORS, type DeviceCommand } from "../lib/devices/commands";
import type { DeviceRow } from "../lib/devices/types";
import { FlashIcon, PowerOffIcon, PowerOnIcon, TestIcon } from "./icons";

const popoverId = (row: DeviceRow) => `actions-${row.id}`;
const anchorName = (row: DeviceRow) => `--actions-${row.id}`;

export function DeviceActions({
  row,
  busy,
}: {
  row: DeviceRow;
  busy: boolean;
}) {
  // Devices without a light, such as switches and sensors, cannot be tested.
  if (!row.light) return null;
  return (
    // The popover API keeps the menu above the table's scroll container.
    <button
      type="button"
      popoverTarget={popoverId(row)}
      style={{ anchorName: anchorName(row) } as CSSProperties}
      className="btn join-item btn-ghost btn-xs"
      disabled={busy}
    >
      {busy ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <TestIcon />
      )}
      Test
      <span className="sr-only">{row.name}</span>
    </button>
  );
}

/**
 * The menu sits beside the join rather than inside it, because join squares off
 * the corners of every child between the first and the last.
 */
export function DeviceMenu({
  row,
  run,
}: {
  row: DeviceRow;
  run: (row: DeviceRow, command: DeviceCommand) => void;
}) {
  const light = row.light;
  if (!light) return null;

  // Closing the menu uncovers the button so its spinner reports the progress.
  const choose = (command: DeviceCommand) => {
    document.getElementById(popoverId(row))?.hidePopover();
    run(row, command);
  };

  return (
    <ul
      id={popoverId(row)}
      popover="auto"
      style={
        {
          positionAnchor: anchorName(row),
          positionTryFallbacks: "flip-block",
        } as CSSProperties
      }
      className="dropdown dropdown-end menu w-56 rounded-box border border-base-content/15 bg-base-200 shadow-lg"
    >
      <li className="menu-title truncate">{row.name}</li>
      <li>
        <button type="button" onClick={() => choose({ action: "identify" })}>
          <FlashIcon />
          Flash to identify
        </button>
      </li>
      <li>
        <button type="button" onClick={() => choose({ action: "on" })}>
          <PowerOnIcon />
          Turn on
        </button>
      </li>
      <li>
        <button type="button" onClick={() => choose({ action: "off" })}>
          <PowerOffIcon />
          Turn off
        </button>
      </li>
      {light.color && (
        <>
          <li />
          <li className="menu-title">Set color</li>
          {COLORS.map((color) => (
            <li key={color.hex}>
              <button
                type="button"
                onClick={() => choose({ action: "color", hex: color.hex })}
              >
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: color.hex }}
                  className="size-4 shrink-0 rounded-full border border-base-content/20"
                />
                {color.name}
              </button>
            </li>
          ))}
        </>
      )}
    </ul>
  );
}
