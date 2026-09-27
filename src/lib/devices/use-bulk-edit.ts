"use client";

import { useCallback, useState } from "react";
import { editDevice, sendCommand } from "../bridges/browser";
import type { PairedBridge } from "../bridges/types";
import { useToasts } from "../ui/toasts";
import type { DeviceRow, GroupOption } from "./types";

export type BulkCatalog = Record<
  string,
  { rooms: GroupOption[]; zones: GroupOption[] }
>;

/** Matches the option value the bulk room picker uses to mean "no room". */
export const UNASSIGNED = "";

export type BulkAction =
  | { kind: "room"; roomName: string }
  | { kind: "zone-add" | "zone-remove"; zoneName: string }
  | { kind: "identify" };

/** Why a row did not change, so the summary toast can name the reason. */
type Outcome =
  | "applied"
  | "unchanged"
  | "no-light"
  | "no-match"
  | "no-bridge"
  | "failed";

const REASONS: Record<Exclude<Outcome, "applied">, string> = {
  unchanged: "already matched the target",
  "no-light": "have no light service",
  "no-match": "have no matching room or zone on their bridge",
  "no-bridge": "are on a bridge that is no longer paired",
  failed: "could not be reached",
};

/**
 * Applies one action to many rows across possibly several bridges. Names,
 * not ids, cross the bridge boundary, since each bridge has its own catalog
 * of room and zone ids; a row is skipped when its bridge has no match.
 */
export function useBulkEdit(
  bridges: PairedBridge[],
  catalog: BulkCatalog,
  refresh: () => void,
) {
  const [running, setRunning] = useState(false);
  const { notify } = useToasts();

  const run = useCallback(
    async (rows: DeviceRow[], action: BulkAction) => {
      if (rows.length === 0) return;
      setRunning(true);
      const counts: Record<Outcome, number> = {
        applied: 0,
        unchanged: 0,
        "no-light": 0,
        "no-match": 0,
        "no-bridge": 0,
        failed: 0,
      };

      for (const row of rows) {
        const bridge = bridges.find((item) => item.id === row.bridgeId);
        const groups = catalog[row.bridgeId];
        counts[
          !bridge || !groups
            ? "no-bridge"
            : await applyOne(bridge, groups, row, action)
        ] += 1;
      }

      setRunning(false);
      if (counts.applied > 0) {
        notify({
          tone: "success",
          key: "bulk",
          message: `Updated ${counts.applied} ${counts.applied === 1 ? "device" : "devices"}.`,
        });
      }
      for (const reason of Object.keys(REASONS) as (keyof typeof REASONS)[]) {
        const count = counts[reason];
        if (count === 0) continue;
        notify({
          tone: "error",
          key: `bulk-${reason}`,
          message: `${count} ${count === 1 ? "device" : "devices"} ${count === 1 ? "was" : "were"} skipped: ${count === 1 ? "it" : "they"} ${REASONS[reason]}.`,
        });
      }
      if (action.kind !== "identify") refresh();
    },
    [bridges, catalog, notify, refresh],
  );

  return { run, running };
}

async function applyOne(
  bridge: PairedBridge,
  groups: { rooms: GroupOption[]; zones: GroupOption[] },
  row: DeviceRow,
  action: BulkAction,
): Promise<Outcome> {
  try {
    if (action.kind === "identify") {
      if (!row.light) return "no-light";
      await sendCommand(bridge, row.id, { action: "identify" });
      return "applied";
    }
    if (action.kind === "room") {
      if (action.roomName === UNASSIGNED) {
        if (row.roomId === null) return "unchanged";
        await editDevice(bridge, { deviceId: row.id, roomId: null });
        return "applied";
      }
      const room = groups.rooms.find((item) => item.name === action.roomName);
      if (!room) return "no-match";
      if (room.id === row.roomId) return "unchanged";
      await editDevice(bridge, { deviceId: row.id, roomId: room.id });
      return "applied";
    }
    // Zones hold light services, so a switch or sensor cannot join one.
    if (!row.light) return "no-light";
    const zone = groups.zones.find((item) => item.name === action.zoneName);
    if (!zone) return "no-match";
    const has = row.zoneIds.includes(zone.id);
    if (action.kind === "zone-add" ? has : !has) return "unchanged";
    const zoneIds =
      action.kind === "zone-add"
        ? [...row.zoneIds, zone.id]
        : row.zoneIds.filter((id) => id !== zone.id);
    await editDevice(bridge, { deviceId: row.id, zoneIds });
    return "applied";
  } catch {
    return "failed";
  }
}
