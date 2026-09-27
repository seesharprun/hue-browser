export class DeviceDataError extends Error {}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const text = (value: unknown) =>
  typeof value === "string" ? value : "";

export const reference = (value: unknown): string | null =>
  isRecord(value) && typeof value.rid === "string" ? value.rid : null;

/**
 * A room lists the devices it holds, while a zone lists their light services,
 * so membership edits have to target the right kind of reference.
 */
export type GroupRecord = { id: string; name: string; children: string[] };

export function groupRecord(
  item: Record<string, unknown>,
  label: string,
): GroupRecord {
  if (
    typeof item.id !== "string" ||
    !isRecord(item.metadata) ||
    !Array.isArray(item.children)
  ) {
    throw new DeviceDataError(`The bridge returned invalid ${label} data.`);
  }
  return {
    id: item.id,
    name: text(item.metadata.name) || `Unnamed ${label}`,
    children: item.children
      .map(reference)
      .filter((id): id is string => id !== null),
  };
}

export function readResources(value: unknown): unknown[] {
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
  return value.data;
}

/** Collects every group of one type, keyed by ID and by member. */
export function collectGroups(resources: unknown[], type: "room" | "zone") {
  const groups: GroupRecord[] = [];
  for (const item of resources) {
    if (!isRecord(item) || typeof item.type !== "string") {
      throw new DeviceDataError("The bridge returned invalid resource data.");
    }
    if (item.type === type) groups.push(groupRecord(item, type));
  }
  return groups;
}
