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
      let applied = 0;
      let skipped = 0;

      for (const row of rows) {
        const bridge = bridges.find((item) => item.id === row.bridgeId);
        const groups = catalog[row.bridgeId];
        if (!bridge || !groups) {
          skipped += 1;
          continue;
        }
        const ok = await applyOne(bridge, groups, row, action);
        if (ok) applied += 1;
        else skipped += 1;
      }

      setRunning(false);
      if (applied > 0) {
        notify({
          tone: "success",
          key: "bulk",
          message: `Updated ${applied} ${applied === 1 ? "device" : "devices"}.`,
        });
      }
      if (skipped > 0) {
        notify({
          tone: "error",
          key: "bulk-skipped",
          message: `Skipped ${skipped} ${skipped === 1 ? "device" : "devices"} with no match on their bridge.`,
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
): Promise<boolean> {
  try {
    if (action.kind === "identify") {
      if (!row.light) return false;
      await sendCommand(bridge, row.id, { action: "identify" });
      return true;
    }
    if (action.kind === "room") {
      if (action.roomName === UNASSIGNED) {
        if (row.roomId === null) return false;
        await editDevice(bridge, { deviceId: row.id, roomId: null });
        return true;
      }
      const room = groups.rooms.find((item) => item.name === action.roomName);
      if (!room || room.id === row.roomId) return false;
      await editDevice(bridge, { deviceId: row.id, roomId: room.id });
      return true;
    }
    // Zones hold light services, so a switch or sensor cannot join one.
    if (!row.light) return false;
    const zone = groups.zones.find((item) => item.name === action.zoneName);
    if (!zone) return false;
    const has = row.zoneIds.includes(zone.id);
    if (action.kind === "zone-add" ? has : !has) return false;
    const zoneIds =
      action.kind === "zone-add"
        ? [...row.zoneIds, zone.id]
        : row.zoneIds.filter((id) => id !== zone.id);
    await editDevice(bridge, { deviceId: row.id, zoneIds });
    return true;
  } catch {
    return false;
  }
}
