"use client";

import type { ColumnKey } from "../lib/devices/columns";
import type { DeviceCommand } from "../lib/devices/commands";
import { groupId } from "../lib/devices/filtering";
import type { DeviceRow } from "../lib/devices/types";
import type { DeviceView } from "../lib/devices/use-device-view";
import type { Selection } from "../lib/devices/use-selection";
import { ColumnHeader } from "./column-header";
import { SelectAllCheckbox } from "./device-select-cell";
import { DeviceTableRow, type Spreadsheet } from "./device-table-row";

export type { Spreadsheet };

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

export function DeviceTable({
  group,
  view,
  command,
  accordion,
  spreadsheet,
  selection,
  onEdit,
}: {
  group: Group;
  view: DeviceView;
  command: CommandState;
  accordion: Accordion;
  spreadsheet: Spreadsheet | null;
  selection: Selection;
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
              <th scope="col">
                <SelectAllCheckbox
                  rows={group.rows}
                  title={group.title}
                  selection={selection}
                />
              </th>
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
              return (
                <DeviceTableRow
                  key={key}
                  row={row}
                  rows={group.rows}
                  view={view}
                  command={command}
                  expanded={accordion.open === key}
                  spreadsheet={spreadsheet}
                  selection={selection}
                  onToggle={() => accordion.toggle(key)}
                  onEdit={() => onEdit(row)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
