import { DeviceDataError, isRecord, reference } from "./groups.ts";

export const UUID = /^[a-f0-9-]{36}$/i;

export function findDevice(resources: unknown[], deviceId: string) {
  for (const item of resources) {
    if (isRecord(item) && item.type === "device" && item.id === deviceId) {
      return item;
    }
  }
  throw new DeviceDataError("That device is no longer on this bridge.");
}

/** A zone holds light services, so a device joins one through its light. */
export function lightOf(device: Record<string, unknown>): string | null {
  if (!Array.isArray(device.services)) return null;
  for (const service of device.services) {
    if (isRecord(service) && service.rtype === "light")
      return reference(service);
  }
  return null;
}

export function members(
  children: string[],
  id: string,
  present: boolean,
  rtype: string,
) {
  const kept = children.filter((child) => child !== id);
  return (present ? [...kept, id] : kept).map((rid) => ({ rid, rtype }));
}
