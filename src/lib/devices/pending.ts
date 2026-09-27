import { NAME_LIMIT } from "./edits.ts";
import type { DeviceRow } from "./types.ts";

/** The edited state of one row, whether or not it differs from the bridge. */
export type Draft = {
  name: string;
  roomId: string | null;
  zoneIds: string[];
};

export const rowKey = (row: Pick<DeviceRow, "bridgeId" | "id">) =>
  `${row.bridgeId}:${row.id}`;

export const original = (
  row: Pick<DeviceRow, "name" | "roomId" | "zoneIds">,
): Draft => ({
  name: row.name,
  roomId: row.roomId,
  zoneIds: row.zoneIds,
});

/** Zone membership is a set, so a reordered selection is not a change. */
export const same = (a: Draft, b: Draft) =>
  a.name === b.name &&
  a.roomId === b.roomId &&
  a.zoneIds.length === b.zoneIds.length &&
  a.zoneIds.every((id) => b.zoneIds.includes(id));

export const valid = (draft: Draft) => {
  const trimmed = draft.name.trim();
  return trimmed.length > 0 && trimmed.length <= NAME_LIMIT;
};
