"use client";

import { Fragment, useState } from "react";
import type { Column, ColumnKey } from "../lib/devices/columns";
import { groupId } from "../lib/devices/filtering";
import type { DeviceRow } from "../lib/devices/types";
import type { DeviceView } from "../lib/devices/use-device-view";
import { ColumnHeader } from "./column-header";
import { DeviceDetails } from "./device-details";

type Group = {
  key: string;
  title: string;
  rows: DeviceRow[];
  options: Map<ColumnKey, string[]>;
};

function Cell({
  column,
  row,
  view,
}: {
  column: Column;
  row: DeviceRow;
  view: DeviceView;
}) {
  if (!column.chips) return column.display(row);
  const target = column.key === "zones" ? "zones" : "room";
  return (
    <span className="flex flex-wrap gap-1">
      {column.chips(row).map((value) => (
        <button
          key={value}
          type="button"
          className="badge badge-soft badge-primary badge-sm cursor-pointer"
          onClick={() => view.focusGroup(target, value)}
        >
          {value}
          <span className="sr-only">
            Show the {value} {target === "zones" ? "zone" : "room"}
          </span>
        </button>
      ))}
    </span>
  );
}

export function DeviceTable({
  group,
  view,
}: {
  group: Group;
  view: DeviceView;
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
                <span className="sr-only">Details</span>
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
                        <Cell column={item} row={row} view={view} />
                      </td>
                    ))}
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        aria-expanded={expanded}
                        onClick={() => toggle(key)}
                      >
                        <span aria-hidden="true">
                          {expanded ? "\u2715" : "\u2139"}
                        </span>
                        <span className="sr-only">
                          {expanded ? "Hide" : "Show"} details for {row.name}
                        </span>
                      </button>
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
