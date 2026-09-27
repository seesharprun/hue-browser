import type { DeviceRow, LightService } from "./types";

export class DeviceDataError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const text = (value: unknown) => (typeof value === "string" ? value : "");
const reference = (value: unknown): string | null =>
  isRecord(value) && typeof value.rid === "string" ? value.rid : null;

type Group = { name: string; children: string[] };

function group(item: Record<string, unknown>, label: string): Group {
  if (!isRecord(item.metadata) || !Array.isArray(item.children)) {
    throw new DeviceDataError(`The bridge returned invalid ${label} data.`);
  }
  return {
    name: text(item.metadata.name) || `Unnamed ${label}`,
    children: item.children
      .map(reference)
      .filter((id): id is string => id !== null),
  };
}

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
): DeviceRow[] {
  if (
    !isRecord(value) ||
    !Array.isArray(value.data) ||
    !Array.isArray(value.errors)
  ) {
    throw new DeviceDataError("The bridge returned invalid resource data.");
  }
  if (value.errors.length) {
    throw new DeviceDataError(
      "The bridge could not list all resources. Check its connection and application key.",
    );
  }
  const resources: unknown[] = value.data;
  const rooms = new Map<string, string>();
  const zones: Group[] = [];
  const macs = new Map<string, string>();
  const lights = new Map<string, LightService>();
  for (const item of resources) {
    if (!isRecord(item) || typeof item.type !== "string") {
      throw new DeviceDataError("The bridge returned invalid resource data.");
    }
    if (item.type === "room") {
      const room = group(item, "room");
      for (const child of room.children) rooms.set(child, room.name);
    }
    // A zone lists the services it contains rather than whole devices.
    if (item.type === "zone") zones.push(group(item, "zone"));
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
    const row: DeviceRow = {
      id: parsed.id,
      bridgeId,
      bridgeName,
      name: text(parsed.metadata.name) || "Unnamed device",
      product: text(parsed.product.product_name) || "Unknown product",
      model: text(parsed.product.model_id) || "Unknown",
      type: text(parsed.metadata.archetype) || "unknown",
      room: rooms.get(parsed.id) ?? "Unassigned",
      zones: [],
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
  for (const zone of zones) {
    for (const child of zone.children) {
      const row = owners.get(child);
      if (row && !row.zones.includes(zone.name)) row.zones.push(zone.name);
    }
  }
  for (const row of devices) row.zones.sort((a, b) => a.localeCompare(b));
  return devices;
}
