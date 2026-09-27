"use client";

import type { Column } from "../lib/devices/columns";
import { NAME_LIMIT } from "../lib/devices/edits";
import type { DeviceRow, GroupOption } from "../lib/devices/types";
import type { PendingEdits } from "../lib/devices/use-pending";
import { ZonePicker } from "./zone-picker";

const UNASSIGNED = "";

const EDITABLE = new Set(["name", "room", "zones"]);

export const isEditable = (column: Column) => EDITABLE.has(column.key);

/**
 * The flat grouping is the spreadsheet, so its editable columns are always live
 * inputs. Changed values carry an indicator until the toolbar saves them.
 */
export function DeviceEditCell({
  column,
  row,
  rooms,
  zones,
  pending,
}: {
  column: Column;
  row: DeviceRow;
  rooms: GroupOption[];
  zones: GroupOption[];
  pending: PendingEdits;
}) {
  if (!isEditable(column)) return column.display(row);

  const draft = pending.draftFor(row);
  const { change, saving } = pending;

  if (column.key === "name") {
    const changed = draft.name !== row.name;
    return (
      <Marked changed={changed}>
        <input
          className="input input-sm validator w-full min-w-40"
          value={draft.name}
          onChange={(event) => change(row, { name: event.target.value })}
          disabled={saving}
          required
          maxLength={NAME_LIMIT}
          aria-label={`Name for ${row.name}`}
        />
      </Marked>
    );
  }

  if (column.key === "room") {
    const changed = draft.roomId !== row.roomId;
    return (
      <Marked changed={changed}>
        <select
          className="select select-sm w-full min-w-36"
          value={draft.roomId ?? UNASSIGNED}
          onChange={(event) =>
            change(row, { roomId: event.target.value || null })
          }
          disabled={saving}
          aria-label={`Room for ${row.name}`}
        >
          <option value={UNASSIGNED}>Unassigned</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      </Marked>
    );
  }

  const changed =
    draft.zoneIds.length !== row.zoneIds.length ||
    !draft.zoneIds.every((id) => row.zoneIds.includes(id));

  return (
    <Marked changed={changed}>
      <ZonePicker
        deviceId={row.id}
        zones={zones}
        selected={draft.zoneIds}
        allowed={row.light !== null}
        disabled={saving}
        onToggle={(id) =>
          change(row, {
            zoneIds: draft.zoneIds.includes(id)
              ? draft.zoneIds.filter((zone) => zone !== id)
              : [...draft.zoneIds, id],
          })
        }
      />
    </Marked>
  );
}

/**
 * The indicator dot marks a value that differs from the bridge. The wrapper is
 * always present, because adding it on the first edit would remount the input
 * and drop the caret mid-keystroke.
 */
function Marked({
  changed,
  children,
}: {
  changed: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className="indicator w-full">
      {changed && (
        <span className="indicator-item indicator-top indicator-end badge badge-xs badge-warning">
          <span className="sr-only">Unsaved change</span>
        </span>
      )}
      {children}
    </span>
  );
}
