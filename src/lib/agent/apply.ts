import { NAME_LIMIT } from "../devices/edits.ts";
import { rowKey } from "../devices/pending.ts";
import type { DeviceRow } from "../devices/types.ts";
import type { GroupLookup, Plan, Proposal } from "./types.ts";

type Groups = GroupLookup;

const same = (left: string, right: string) =>
  left.trim().toLowerCase() === right.trim().toLowerCase();

/** Keeps a plan scoped to the slice of the fleet the user described. */
function matches(row: DeviceRow, plan: Plan) {
  const filter = plan.filter;
  if (!filter) return true;
  // A device the bridge never placed has no room name, so the word people
  // actually use for it is the one the dashboard shows.
  if (filter.field === "room")
    return same(row.room || "Unassigned", filter.value);
  if (filter.field === "zone")
    return row.zones.some((zone) => same(zone, filter.value));
  if (filter.field === "type") return same(row.type, filter.value);
  if (filter.field === "product") return same(row.product, filter.value);
  return same(row.bridgeName, filter.value);
}

/** Replaces template tokens; `{n}` counts up within each room. */
export function expand(template: string, row: DeviceRow, index: number) {
  const tokens: Record<string, string> = {
    room: row.room,
    zone: row.zones[0] ?? "",
    product: row.product,
    type: row.type,
    bridge: row.bridgeName,
    model: row.model,
    name: row.name,
    n: String(index),
  };
  return template
    .replace(/\{(\w+)\}/g, (whole, key: string) => tokens[key] ?? whole)
    .replace(/\s+/g, " ")
    .trim();
}

function byName(options: { id: string; name: string }[], value: string) {
  return options.find((option) => same(option.name, value)) ?? null;
}

function renames(rows: DeviceRow[], plan: Plan): Proposal[] {
  const counters: Record<string, number> = {};
  const out: Proposal[] = [];
  for (const row of rows) {
    const bucket = row.room || "Unassigned";
    counters[bucket] = (counters[bucket] ?? 0) + 1;
    const after = expand(plan.template ?? "", row, counters[bucket]);
    // Oversized or empty names would be rejected by the bridge on save.
    if (!after || after.length > NAME_LIMIT) continue;
    if (after === row.name) continue;
    out.push({ key: rowKey(row), row, before: row.name, after, name: after });
  }
  return out;
}

function moves(rows: DeviceRow[], plan: Plan, groups: Groups): Proposal[] {
  const out: Proposal[] = [];
  for (const row of rows) {
    const room = byName(groups[row.bridgeId]?.rooms ?? [], plan.value ?? "");
    // A room that does not exist on this bridge cannot be joined.
    if (!room || room.id === row.roomId) continue;
    out.push({
      key: rowKey(row),
      row,
      before: row.room || "Unassigned",
      after: room.name,
      roomId: room.id,
    });
  }
  return out;
}

/**
 * Room moves are the one change the model cannot scope: it leaves the filter
 * out no matter how the request is phrased, which would turn "file the
 * unassigned ones" into emptying every room in the house. An unscoped move is
 * therefore limited to devices that have no room, which is both the safe
 * reading and the one people actually ask for. Moving a device that is
 * already in a room stays a deliberate, per-device edit.
 */
export function scopeOf(plan: Plan): Plan {
  if (plan.field !== "room" || plan.filter) return plan;
  return { ...plan, filter: { field: "room", value: "Unassigned" } };
}

function zoning(rows: DeviceRow[], plan: Plan, groups: Groups): Proposal[] {
  const out: Proposal[] = [];
  for (const row of rows) {
    // Zones hold light services, so a device without one can never join.
    if (!row.light) continue;
    const zone = byName(groups[row.bridgeId]?.zones ?? [], plan.value ?? "");
    if (!zone) continue;
    const has = row.zoneIds.includes(zone.id);
    if (plan.action === "remove" ? !has : has) continue;
    const zoneIds =
      plan.action === "remove"
        ? row.zoneIds.filter((id) => id !== zone.id)
        : [...row.zoneIds, zone.id];
    const after = row.zones.filter((name) => !same(name, zone.name));
    if (plan.action !== "remove") after.push(zone.name);
    out.push({
      key: rowKey(row),
      row,
      before: row.zones.join(", ") || "None",
      after: after.join(", ") || "None",
      zoneIds,
    });
  }
  return out;
}

/** Turns an agreed plan into the exact rows the user will review. */
export function buildProposals(
  plan: Plan,
  rows: DeviceRow[],
  groups: Groups,
): Proposal[] {
  const scoped = scopeOf(plan);
  const target = rows.filter((row) => matches(row, scoped));
  if (scoped.field === "name") return renames(target, scoped);
  if (scoped.field === "room") return moves(target, scoped, groups);
  return zoning(target, scoped, groups);
}
