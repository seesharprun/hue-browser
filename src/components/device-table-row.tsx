"use client";

import type { DeviceRow, GroupOption } from "../lib/devices/types";
import type { DeviceView } from "../lib/devices/use-device-view";
import type { PendingEdits } from "../lib/devices/use-pending";
import type { Selection } from "../lib/devices/use-selection";
import { DeviceCell } from "./device-cell";
import { DeviceDetails } from "./device-details";
import { DeviceEditCell } from "./device-edit-cell";
import { DeviceRowActions } from "./device-row-actions";
import { SelectRowCheckbox } from "./device-select-cell";
import type { CommandState } from "./device-table";

/** The flat grouping edits in place, so it supplies the pending-edit store. */
export type Spreadsheet = {
  pending: PendingEdits;
  groups: Record<string, { rooms: GroupOption[]; zones: GroupOption[] }>;
};

export function DeviceTableRow({
  row,
  rows,
  view,
  command,
  expanded,
  spreadsheet,
  selection,
  onToggle,
  onEdit,
}: {
  row: DeviceRow;
  /** The group's full row order, so shift-click can measure the range. */
  rows: DeviceRow[];
  view: DeviceView;
  command: CommandState;
  expanded: boolean;
  spreadsheet: Spreadsheet | null;
  selection: Selection;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const catalog = spreadsheet?.groups[row.bridgeId];
  return (
    <>
      <tr className={selection.isSelected(row) ? "bg-primary/10" : ""}>
        <td>
          <SelectRowCheckbox row={row} rows={rows} selection={selection} />
        </td>
        {view.visibleColumns.map((item) => (
          <td key={item.key}>
            {spreadsheet ? (
              <DeviceEditCell
                column={item}
                row={row}
                rooms={catalog?.rooms ?? []}
                zones={catalog?.zones ?? []}
                pending={spreadsheet.pending}
              />
            ) : (
              <DeviceCell column={item} row={row} view={view} />
            )}
          </td>
        ))}
        <td>
          <DeviceRowActions
            row={row}
            command={command}
            expanded={expanded}
            editable={!spreadsheet}
            onToggle={onToggle}
            onEdit={onEdit}
          />
        </td>
      </tr>
      {expanded && (
        <DeviceDetails row={row} span={view.visibleColumns.length + 2} />
      )}
    </>
  );
}
