"use client";

import { useMemo, useState } from "react";
import type { DeviceRow } from "../lib/devices/types";
import type { BulkCatalog } from "../lib/devices/use-bulk-edit";
import { type BulkAction, UNASSIGNED } from "../lib/devices/use-bulk-edit";
import { CloseIcon, FlashIcon, GroupIcon } from "./icons";

/** The union of room or zone names across the bridges the selection spans. */
function names(
  rows: DeviceRow[],
  catalog: BulkCatalog,
  key: "rooms" | "zones",
) {
  const bridgeIds = new Set(rows.map((row) => row.bridgeId));
  const found = new Set<string>();
  for (const bridgeId of bridgeIds) {
    for (const item of catalog[bridgeId]?.[key] ?? []) found.add(item.name);
  }
  return [...found].sort((a, b) => a.localeCompare(b));
}

export function BulkActionBar({
  rows,
  catalog,
  count,
  running,
  onClear,
  onRun,
}: {
  /** The selected rows, resolved from their keys against the visible set. */
  rows: DeviceRow[];
  catalog: BulkCatalog;
  count: number;
  running: boolean;
  onClear: () => void;
  onRun: (action: BulkAction) => void;
}) {
  const [roomName, setRoomName] = useState(UNASSIGNED);
  const [zoneName, setZoneName] = useState("");
  const rooms = useMemo(() => names(rows, catalog, "rooms"), [rows, catalog]);
  const zones = useMemo(() => names(rows, catalog, "zones"), [rows, catalog]);

  if (count === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-box bg-base-200/70 p-3">
      <span className="font-semibold">
        {count} {count === 1 ? "device" : "devices"} selected
      </span>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={onClear}
        disabled={running}
      >
        <CloseIcon />
        Clear selection
      </button>
      <label className="flex items-center gap-2">
        <GroupIcon name="room" label="Room" />
        <select
          className="select select-sm"
          value={roomName}
          onChange={(event) => setRoomName(event.target.value)}
          disabled={running}
        >
          <option value={UNASSIGNED}>Unassigned</option>
          {rooms.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={running}
          onClick={() => onRun({ kind: "room", roomName })}
        >
          Assign room
        </button>
      </label>
      <label className="flex items-center gap-2">
        <GroupIcon name="zones" label="Zone" />
        <select
          className="select select-sm"
          value={zoneName}
          onChange={(event) => setZoneName(event.target.value)}
          disabled={running || zones.length === 0}
        >
          <option value="">
            {zones.length === 0 ? "No zones" : "Choose a zone"}
          </option>
          {zones.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <div className="join">
          <button
            type="button"
            className="btn btn-outline btn-sm join-item"
            disabled={running || !zoneName}
            onClick={() => onRun({ kind: "zone-add", zoneName })}
          >
            Add
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm join-item"
            disabled={running || !zoneName}
            onClick={() => onRun({ kind: "zone-remove", zoneName })}
          >
            Remove
          </button>
        </div>
      </label>
      <button
        type="button"
        className="btn btn-outline btn-sm"
        disabled={running}
        onClick={() => onRun({ kind: "identify" })}
      >
        {running ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          <FlashIcon />
        )}
        Identify
      </button>
    </div>
  );
}
