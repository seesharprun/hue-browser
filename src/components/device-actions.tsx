"use client";

import { type CSSProperties, useRef } from "react";
import { COLORS, type DeviceCommand } from "../lib/devices/commands";
import type { DeviceRow } from "../lib/devices/types";
import { FlashIcon, PowerOffIcon, PowerOnIcon, TestIcon } from "./icons";

export function DeviceActions({
  row,
  run,
  busy,
}: {
  row: DeviceRow;
  run: (row: DeviceRow, command: DeviceCommand) => void;
  busy: boolean;
}) {
  const popover = `actions-${row.id}`;
  const anchor = `--${popover}`;
  const light = row.light;
  const menu = useRef<HTMLUListElement>(null);

  // Closing the menu uncovers the button so its spinner reports the progress.
  const choose = (command: DeviceCommand) => {
    menu.current?.hidePopover();
    run(row, command);
  };

  // Devices without a light, such as switches and sensors, have nothing to test.
  if (!light) return null;

  return (
    <>
      {/* The popover API keeps the menu above the table's scroll container. */}
      <button
        type="button"
        popoverTarget={popover}
        style={{ anchorName: anchor } as CSSProperties}
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
      <ul
        ref={menu}
        id={popover}
        popover="auto"
        style={
          {
            positionAnchor: anchor,
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
    </>
  );
}
