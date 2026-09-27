"use client";

import type { DeviceRow } from "../lib/devices/types";
import { DeviceActions, DeviceMenu } from "./device-actions";
import type { CommandState } from "./device-table";
import { CloseIcon, DetailsIcon, EditIcon } from "./icons";

/**
 * The join groups the row's controls into one segmented control; the popover
 * menu sits outside it so join does not square off the menu's corners.
 */
export function DeviceRowActions({
  row,
  command,
  expanded,
  editable,
  onToggle,
  onEdit,
}: {
  row: DeviceRow;
  command: CommandState;
  expanded: boolean;
  /** The spreadsheet edits in the cells, so it has no per-row edit button. */
  editable: boolean;
  onToggle: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="flex justify-end">
      <div className="join">
        {editable && (
          <button
            type="button"
            className="btn join-item btn-ghost btn-xs"
            onClick={onEdit}
          >
            <EditIcon />
            Edit
            <span className="sr-only">{row.name}</span>
          </button>
        )}
        <DeviceActions row={row} busy={command.pending === row.id} />
        {/* The swap turns the icon over rather than replacing it, so the
            control never appears to jump. */}
        <button
          type="button"
          className={`btn swap join-item swap-rotate btn-ghost btn-xs ${
            expanded ? "swap-active" : ""
          }`}
          aria-expanded={expanded}
          onClick={onToggle}
        >
          <span className="swap-off flex items-center gap-1">
            <DetailsIcon />
            Details
          </span>
          <span className="swap-on flex items-center gap-1">
            <CloseIcon />
            Close
          </span>
          <span className="sr-only">{row.name}</span>
        </button>
      </div>
      <DeviceMenu row={row} run={command.run} />
    </div>
  );
}
