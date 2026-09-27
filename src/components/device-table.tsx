"use client";

import { Fragment } from "react";
import type { ColumnKey } from "../lib/devices/columns";
import type { DeviceCommand } from "../lib/devices/commands";
import { groupId } from "../lib/devices/filtering";
import type { DeviceRow, GroupOption } from "../lib/devices/types";
import type { DeviceView } from "../lib/devices/use-device-view";
import type { PendingEdits } from "../lib/devices/use-pending";
import { ColumnHeader } from "./column-header";
import { DeviceCell } from "./device-cell";
import { DeviceDetails } from "./device-details";
import { DeviceEditCell } from "./device-edit-cell";
import { DeviceRowActions } from "./device-row-actions";

type Group = {
  key: string;
  title: string;
  rows: DeviceRow[];
  options: Map<ColumnKey, string[]>;
};

export type CommandState = {
  run: (row: DeviceRow, command: DeviceCommand) => void;
  pending: string;
};

export type Accordion = {
  open: string;
  toggle: (key: string) => void;
};

/** The flat grouping edits in place, so it supplies the pending-edit store. */
export type Spreadsheet = {
  pending: PendingEdits;
  groups: Record<string, { rooms: GroupOption[]; zones: GroupOption[] }>;
};

export function DeviceTable({
  group,
  view,
  command,
  accordion,
  spreadsheet,
  onEdit,
}: {
  group: Group;
  view: DeviceView;
  command: CommandState;
  accordion: Accordion;
  spreadsheet: Spreadsheet | null;
  onEdit: (row: DeviceRow) => void;
}) {
  return (
    <section
      id={groupId(group.key)}
      className="mb-6 scroll-mt-4 rounded-box bg-base-200/70"
    >
      {group.title && (
        <h2 className="px-4 pt-4 font-semibold">
          {group.title}{" "}
          <span className="text-sm font-normal text-base-content/60">
            ({group.rows.length})
          </span>
        </h2>
      )}
      <div className="overflow-x-auto">
        {/* Cells size to their content and the section scrolls sideways, so a
            long product name never stacks onto a second line. */}
        <table className="table table-zebra whitespace-nowrap">
          <thead>
            <tr>
              {view.visibleColumns.map((item) => (
                <ColumnHeader
                  key={item.key}
                  column={item}
                  view={view}
                  scope={group.key}
                  options={group.options}
                />
              ))}
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {group.rows.map((row) => {
              const key = `${row.bridgeId}:${row.id}`;
              const expanded = accordion.open === key;
              const catalog = spreadsheet?.groups[row.bridgeId];
              return (
                <Fragment key={key}>
                  <tr>
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
                        onToggle={() => accordion.toggle(key)}
                        onEdit={() => onEdit(row)}
                      />
                    </td>
                  </tr>
                  {expanded && (
                    <DeviceDetails
                      row={row}
                      span={view.visibleColumns.length + 1}
                    />
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
