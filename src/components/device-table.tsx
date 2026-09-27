"use client";

import { Fragment } from "react";
import type { ColumnKey } from "../lib/devices/columns";
import type { DeviceCommand } from "../lib/devices/commands";
import { groupId } from "../lib/devices/filtering";
import type { DeviceRow } from "../lib/devices/types";
import type { DeviceView } from "../lib/devices/use-device-view";
import { ColumnHeader } from "./column-header";
import { DeviceActions } from "./device-actions";
import { DeviceCell } from "./device-cell";
import { DeviceDetails } from "./device-details";
import { CloseIcon, DetailsIcon } from "./icons";

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
}: {
  group: Group;
  view: DeviceView;
  command: CommandState;
  accordion: Accordion;
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
              return (
                <Fragment key={key}>
                  <tr>
                    {view.visibleColumns.map((item) => (
                      <td key={item.key}>
                        <DeviceCell column={item} row={row} view={view} />
                      </td>
                    ))}
                    <td>
                      <span className="join flex justify-end">
                        <DeviceActions
                          row={row}
                          run={command.run}
                          busy={command.pending === row.id}
                        />
                        {/* The swap turns the icon over rather than replacing
                            it, so the control never appears to jump. */}
                        <label className="swap swap-rotate btn join-item btn-ghost btn-xs">
                          <input
                            type="checkbox"
                            checked={expanded}
                            onChange={() => accordion.toggle(key)}
                            aria-label={`Details for ${row.name}`}
                          />
                          <span className="swap-off flex items-center gap-1">
                            <DetailsIcon />
                            Details
                          </span>
                          <span className="swap-on flex items-center gap-1">
                            <CloseIcon />
                            Close
                          </span>
                        </label>
                      </span>
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
