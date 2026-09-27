import {
  collectGroups,
  DeviceDataError,
  isRecord,
  reference,
} from "./groups.ts";

/** Philips Hue rejects names outside this range. */
export const NAME_LIMIT = 32;

export type EditRequest = {
  deviceId: string;
  name?: string;
  /** Undefined leaves the room alone; null moves the device to Unassigned. */
  roomId?: string | null;
  zoneIds?: string[];
};

export type Update = { path: string; body: unknown };

const UUID = /^[a-f0-9-]{36}$/i;

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
  if (value.zoneIds !== undefined) {
    if (!Array.isArray(value.zoneIds)) return false;
    if (!value.zoneIds.every((id) => typeof id === "string" && UUID.test(id)))
      return false;
  }
  return true;
}

function findDevice(resources: unknown[], deviceId: string) {
  for (const item of resources) {
    if (isRecord(item) && item.type === "device" && item.id === deviceId)
      return item;
  }
  throw new DeviceDataError("That device is no longer on this bridge.");
}

/** A zone holds light services, so a device joins one through its light. */
function lightOf(device: Record<string, unknown>): string | null {
  if (!Array.isArray(device.services)) return null;
  for (const service of device.services) {
    if (isRecord(service) && service.rtype === "light")
      return reference(service);
  }
  return null;
}

function members(
  children: string[],
  id: string,
  present: boolean,
  rtype: string,
) {
  const kept = children.filter((child) => child !== id);
  return (present ? [...kept, id] : kept).map((rid) => ({ rid, rtype }));
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

  if (edit.roomId !== undefined) {
    const rooms = collectGroups(resources, "room");
    const current = rooms.find((room) => room.children.includes(edit.deviceId));
    if ((current?.id ?? null) !== edit.roomId) {
      if (current) {
        updates.push({
          path: `/clip/v2/resource/room/${current.id}`,
          body: {
            children: members(current.children, edit.deviceId, false, "device"),
          },
        });
      }
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

  if (edit.zoneIds !== undefined) {
    const light = lightOf(device);
    const zones = collectGroups(resources, "zone");
    const wanted = new Set(edit.zoneIds);
    for (const id of wanted) {
      if (!zones.some((zone) => zone.id === id))
        throw new DeviceDataError("That zone is no longer on this bridge.");
    }
    if (!light && wanted.size) {
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
  }

  return updates;
}
