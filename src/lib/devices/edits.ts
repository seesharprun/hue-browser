import { findDevice, lightOf, members, UUID } from "./edit-targets.ts";
import {
  createGroupUpdate,
  isRoomCreate,
  isZoneCreate,
  NAME_LIMIT,
  type RoomCreate,
  type ZoneCreate,
} from "./group-create.ts";
import { collectGroups, DeviceDataError, isRecord } from "./groups.ts";

export { NAME_LIMIT };

export type EditRequest = {
  deviceId: string;
  name?: string;
  /** Undefined leaves the room alone; null moves the device to Unassigned. */
  roomId?: string | null;
  createRoom?: RoomCreate;
  zoneIds?: string[];
  createZones?: ZoneCreate[];
};

export type Update = { method?: "PUT" | "POST"; path: string; body: unknown };

export function isEditRequest(value: unknown): value is EditRequest {
  if (!isRecord(value) || typeof value.deviceId !== "string") return false;
  if (!UUID.test(value.deviceId)) return false;
  if (value.name !== undefined) {
    if (typeof value.name !== "string") return false;
    const trimmed = value.name.trim();
    if (!trimmed || trimmed.length > NAME_LIMIT) return false;
  }
  if (value.roomId !== undefined && value.roomId !== null) {
    if (typeof value.roomId !== "string" || !UUID.test(value.roomId))
      return false;
  }
  if (value.roomId !== undefined && value.createRoom !== undefined) {
    return false;
  }
  if (value.createRoom !== undefined && !isRoomCreate(value.createRoom)) {
    return false;
  }
  if (value.zoneIds !== undefined) {
    if (!Array.isArray(value.zoneIds)) return false;
    if (!value.zoneIds.every((id) => typeof id === "string" && UUID.test(id)))
      return false;
  }
  if (value.createZones !== undefined) {
    if (
      !Array.isArray(value.createZones) ||
      !value.createZones.every(isZoneCreate)
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Membership is a whole-array PUT on the room or zone, so each change is
 * expressed as the group's full child list rather than a delta.
 */
export function planEdits(resources: unknown[], edit: EditRequest): Update[] {
  const device = findDevice(resources, edit.deviceId);
  const updates: Update[] = [];

  if (edit.name !== undefined) {
    updates.push({
      path: `/clip/v2/resource/device/${edit.deviceId}`,
      body: { metadata: { name: edit.name.trim() } },
    });
  }

  if (edit.roomId !== undefined || edit.createRoom) {
    const rooms = collectGroups(resources, "room");
    const current = rooms.find((room) => room.children.includes(edit.deviceId));
    if (edit.createRoom || (current?.id ?? null) !== edit.roomId) {
      if (current) {
        updates.push({
          path: `/clip/v2/resource/room/${current.id}`,
          body: {
            children: members(current.children, edit.deviceId, false, "device"),
          },
        });
      }
      if (edit.createRoom) {
        updates.push(
          createGroupUpdate({
            type: "room",
            ...edit.createRoom,
            deviceId: edit.deviceId,
          }),
        );
      } else {
        const target = edit.roomId
          ? rooms.find((room) => room.id === edit.roomId)
          : null;
        if (edit.roomId && !target) {
          throw new DeviceDataError("That room is no longer on this bridge.");
        }
        if (target) {
          updates.push({
            path: `/clip/v2/resource/room/${target.id}`,
            body: {
              children: members(target.children, edit.deviceId, true, "device"),
            },
          });
        }
      }
    }
  }

  if (edit.zoneIds !== undefined || edit.createZones?.length) {
    const light = lightOf(device);
    const zones = collectGroups(resources, "zone");
    const wanted = new Set(edit.zoneIds ?? []);
    for (const id of wanted) {
      if (!zones.some((zone) => zone.id === id))
        throw new DeviceDataError("That zone is no longer on this bridge.");
    }
    if (!light && (wanted.size || edit.createZones?.length)) {
      throw new DeviceDataError(
        "This device has no light, so it cannot join a zone.",
      );
    }
    for (const zone of zones) {
      if (!light) continue;
      const has = zone.children.includes(light);
      const should = wanted.has(zone.id);
      if (has === should) continue;
      updates.push({
        path: `/clip/v2/resource/zone/${zone.id}`,
        body: {
          children: members(zone.children, light, should, "light"),
        },
      });
    }
    for (const zone of edit.createZones ?? []) {
      updates.push(
        createGroupUpdate({ type: "zone", ...zone, lightId: light as string }),
      );
    }
  }

  return updates;
}
