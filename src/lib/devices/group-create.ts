import { isRecord } from "./groups.ts";

/** Philips Hue rejects names outside this range. */
export const NAME_LIMIT = 32;

export type RoomCreate = { name: string; archetype: string };
export type ZoneCreate = { name: string };
export type GroupCreateRequest =
  | (RoomCreate & { type: "room"; deviceId?: string })
  | (ZoneCreate & { type: "zone"; lightId?: string });

const UUID = /^[a-f0-9-]{36}$/i;
const ARCHETYPE = /^[a-z][a-z0-9_]{1,31}$/;

export function validName(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= NAME_LIMIT
  );
}

export function isRoomCreate(value: unknown): value is RoomCreate {
  return (
    isRecord(value) &&
    validName(value.name) &&
    typeof value.archetype === "string" &&
    ARCHETYPE.test(value.archetype)
  );
}

export function isZoneCreate(value: unknown): value is ZoneCreate {
  return isRecord(value) && validName(value.name);
}

export function isCreateGroupRequest(
  value: unknown,
): value is GroupCreateRequest {
  if (!isRecord(value)) return false;
  if (value.type === "room") {
    return (
      isRoomCreate(value) &&
      (value.deviceId === undefined ||
        (typeof value.deviceId === "string" && UUID.test(value.deviceId)))
    );
  }
  if (value.type === "zone") {
    return (
      isZoneCreate(value) &&
      (value.lightId === undefined ||
        (typeof value.lightId === "string" && UUID.test(value.lightId)))
    );
  }
  return false;
}

export function roomCreateBody(room: RoomCreate, deviceId?: string) {
  return {
    metadata: {
      name: room.name.trim(),
      archetype: room.archetype,
    },
    children: deviceId ? [{ rid: deviceId, rtype: "device" }] : [],
  };
}

export function zoneCreateBody(zone: ZoneCreate, lightId?: string) {
  return {
    metadata: { name: zone.name.trim() },
    children: lightId ? [{ rid: lightId, rtype: "light" }] : [],
  };
}

export function createGroupUpdate(create: GroupCreateRequest) {
  if (create.type === "room") {
    return {
      method: "POST" as const,
      path: "/clip/v2/resource/room",
      body: roomCreateBody(create, create.deviceId),
    };
  }
  return {
    method: "POST" as const,
    path: "/clip/v2/resource/zone",
    body: zoneCreateBody(create, create.lightId),
  };
}
