import {
  collectGroups,
  DeviceDataError,
  isRecord,
  reference,
} from "./groups.ts";

export type GroupKind = "room" | "zone";

export type MigrationRequest = {
  groupType: GroupKind;
  sourceId: string;
  destinationId: string | null;
};

export type MigrationDevice = { id: string; name: string };

export type MigrationResult = MigrationDevice & {
  status: "moved" | "failed" | "skipped";
  error?: string;
};

type DeviceRecord = MigrationDevice & { light: string | null };

export type PlannedDevice = MigrationDevice & {
  updates: { path: string; body: unknown }[];
};

const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export function isMigrationRequest(value: unknown): value is MigrationRequest {
  return (
    isRecord(value) &&
    (value.groupType === "room" || value.groupType === "zone") &&
    typeof value.sourceId === "string" &&
    UUID.test(value.sourceId) &&
    (value.destinationId === null ||
      (typeof value.destinationId === "string" &&
        UUID.test(value.destinationId)))
  );
}

function deviceName(item: Record<string, unknown>) {
  return isRecord(item.metadata) && typeof item.metadata.name === "string"
    ? item.metadata.name
    : "Unnamed device";
}

function lightOf(item: Record<string, unknown>) {
  if (!Array.isArray(item.services)) return null;
  for (const service of item.services) {
    if (isRecord(service) && service.rtype === "light")
      return reference(service);
  }
  return null;
}

function devices(resources: unknown[]) {
  const records = new Map<string, DeviceRecord>();
  const byLight = new Map<string, DeviceRecord>();
  for (const item of resources) {
    if (
      !isRecord(item) ||
      item.type !== "device" ||
      typeof item.id !== "string"
    )
      continue;
    const record = {
      id: item.id,
      name: deviceName(item),
      light: lightOf(item),
    };
    records.set(record.id, record);
    if (record.light) byLight.set(record.light, record);
  }
  return { records, byLight };
}

const refs = (children: string[], rtype: string) =>
  children.map((rid) => ({ rid, rtype }));

export function planMigration(resources: unknown[], request: MigrationRequest) {
  const groups = collectGroups(resources, request.groupType);
  const source = groups.find((group) => group.id === request.sourceId);
  if (!source)
    throw new DeviceDataError("The source group is no longer on this bridge.");
  const destination = request.destinationId
    ? groups.find((group) => group.id === request.destinationId)
    : null;
  if (request.destinationId && !destination) {
    throw new DeviceDataError(
      "The destination group is no longer on this bridge.",
    );
  }
  if (destination?.id === source.id) {
    throw new DeviceDataError("Choose a different destination group.");
  }

  const { records, byLight } = devices(resources);
  const rtype = request.groupType === "room" ? "device" : "light";
  const sourceChildren = new Set(source.children);
  const destinationChildren = destination ? [...destination.children] : null;
  const destinationId = destination?.id;
  const planned: PlannedDevice[] = [];

  for (const member of source.children) {
    const device =
      request.groupType === "room" ? records.get(member) : byLight.get(member);
    if (!device)
      throw new DeviceDataError("The source group contains an unknown device.");
    const rid = request.groupType === "room" ? device.id : device.light;
    if (!rid)
      throw new DeviceDataError(
        "The source zone contains a device without a light.",
      );
    const updates: PlannedDevice["updates"] = [];
    if (!sourceChildren.delete(rid)) {
      throw new DeviceDataError(
        "The source group contains duplicate or unexpected members.",
      );
    }
    updates.push({
      path: `/clip/v2/resource/${request.groupType}/${source.id}`,
      body: { children: refs([...sourceChildren], rtype) },
    });
    if (
      destinationId &&
      destinationChildren &&
      !destinationChildren.includes(rid)
    ) {
      destinationChildren.push(rid);
      updates.push({
        path: `/clip/v2/resource/${request.groupType}/${destinationId}`,
        body: { children: refs(destinationChildren, rtype) },
      });
    }
    planned.push({ id: device.id, name: device.name, updates });
  }

  return planned;
}
