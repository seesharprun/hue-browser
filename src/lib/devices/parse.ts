import {
  collectGroups,
  DeviceDataError,
  isRecord,
  readResources,
  reference,
  text,
} from "./groups.ts";
import type { BridgeDevices, DeviceRow, LightService } from "./types";

export { DeviceDataError };

function device(item: Record<string, unknown>) {
  if (
    typeof item.id !== "string" ||
    !isRecord(item.metadata) ||
    typeof item.metadata.name !== "string" ||
    typeof item.metadata.archetype !== "string" ||
    !isRecord(item.product_data) ||
    typeof item.product_data.product_name !== "string" ||
    typeof item.product_data.model_id !== "string" ||
    !Array.isArray(item.services) ||
    !item.services.every(
      (service) => isRecord(service) && typeof service.rtype === "string",
    )
  ) {
    throw new DeviceDataError("The bridge returned invalid device data.");
  }
  return {
    id: item.id,
    metadata: item.metadata,
    product: item.product_data,
    services: item.services as Record<string, unknown>[],
  };
}

export function deviceRows(
  value: unknown,
  bridgeId: string,
  bridgeName: string,
): BridgeDevices {
  const resources = readResources(value);
  const roomGroups = collectGroups(resources, "room");
  const zoneGroups = collectGroups(resources, "zone");
  const rooms = new Map<string, { id: string; name: string }>();
  for (const room of roomGroups) {
    for (const child of room.children)
      rooms.set(child, { id: room.id, name: room.name });
  }
  const macs = new Map<string, string>();
  const lights = new Map<string, LightService>();
  for (const item of resources) {
    if (!isRecord(item)) continue;
    // Only the Zigbee service reports a device's MAC address.
    if (item.type === "zigbee_connectivity") {
      const owner = reference(item.owner);
      const mac = text(item.mac_address);
      if (owner && mac) macs.set(owner, mac);
    }
    // The light service carries the switchable state and the command target.
    if (item.type === "light") {
      const owner = reference(item.owner);
      if (owner && typeof item.id === "string") {
        lights.set(owner, {
          id: item.id,
          on: isRecord(item.on) && item.on.on === true,
          // A light omits the color key entirely when it cannot show color.
          color: isRecord(item.color),
        });
      }
    }
  }
  const devices: DeviceRow[] = [];
  const owners = new Map<string, DeviceRow>();
  for (const item of resources) {
    if (!isRecord(item) || item.type !== "device") continue;
    const parsed = device(item);
    const room = rooms.get(parsed.id);
    const row: DeviceRow = {
      id: parsed.id,
      bridgeId,
      bridgeName,
      name: text(parsed.metadata.name) || "Unnamed device",
      product: text(parsed.product.product_name) || "Unknown product",
      model: text(parsed.product.model_id) || "Unknown",
      type: text(parsed.metadata.archetype) || "unknown",
      room: room?.name ?? "Unassigned",
      roomId: room?.id ?? null,
      zones: [],
      zoneIds: [],
      services: [
        ...new Set(
          parsed.services.map((service) => text(service.rtype)).filter(Boolean),
        ),
      ],
      manufacturer: text(parsed.product.manufacturer_name) || "Not reported",
      software: text(parsed.product.software_version) || "Not reported",
      hardware: text(parsed.product.hardware_platform_type) || "Not reported",
      mac: macs.get(parsed.id) ?? "Not reported",
      light: lights.get(parsed.id) ?? null,
    };
    for (const service of parsed.services) {
      const rid = reference(service);
      if (rid) owners.set(rid, row);
    }
    owners.set(parsed.id, row);
    devices.push(row);
  }
  for (const zone of zoneGroups) {
    for (const child of zone.children) {
      const row = owners.get(child);
      if (row && !row.zones.includes(zone.name)) {
        row.zones.push(zone.name);
        row.zoneIds.push(zone.id);
      }
    }
  }
  for (const row of devices) row.zones.sort((a, b) => a.localeCompare(b));
  const options = (groups: { id: string; name: string }[]) =>
    groups
      .map(({ id, name }) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  return {
    devices,
    rooms: options(roomGroups),
    zones: options(zoneGroups),
  };
}
