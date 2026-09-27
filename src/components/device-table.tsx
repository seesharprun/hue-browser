"use client";

import { Fragment, useState } from "react";
import type { ColumnKey } from "../lib/devices/columns";
import type { DeviceCommand } from "../lib/devices/commands";
import { groupId } from "../lib/devices/filtering";
import type { DeviceRow } from "../lib/devices/types";
import type { DeviceView } from "../lib/devices/use-device-view";
import { ColumnHeader } from "./column-header";
import { DeviceActions } from "./device-actions";
import { DeviceCell } from "./device-cell";
import { DeviceDetails } from "./device-details";
import { DetailsIcon } from "./icons";

type Group = {
  key: string;
  title: string;
  rows: DeviceRow[];
  options: Map<ColumnKey, string[]>;
};

export type CommandState = {
  run: (row: DeviceRow, command: DeviceCommand) => void;
  pending: string;
  failed: Record<string, string>;
};

export function DeviceTable({
  group,
  view,
  command,
}: {
  group: Group;
  view: DeviceView;
  command: CommandState;
}) {
  const [open, setOpen] = useState<string[]>([]);
  const toggle = (key: string) =>
    setOpen((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );

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
        <table className="table table-zebra">
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
              const expanded = open.includes(key);
              return (
                <Fragment key={key}>
                  <tr>
                    {view.visibleColumns.map((item) => (
                      <td key={item.key}>
                        <DeviceCell column={item} row={row} view={view} />
                      </td>
                    ))}
                    <td>
                      <span className="flex justify-end gap-1">
                        <DeviceActions
                          row={row}
                          run={command.run}
                          busy={command.pending === row.id}
                        />
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          aria-expanded={expanded}
                          onClick={() => toggle(key)}
                        >
                          <DetailsIcon />
                          Details
                          <span className="sr-only">for {row.name}</span>
                        </button>
                      </span>
                    </td>
                  </tr>
                  {command.failed[row.id] && (
                    <tr>
                      <td colSpan={view.visibleColumns.length + 1}>
                        <p role="alert" className="text-error text-sm">
                          {command.failed[row.id]}
                        </p>
                      </td>
                    </tr>
                  )}
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
