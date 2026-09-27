import type { DeviceRow, GroupOption } from "../devices/types";

/** Rooms and zones keyed by bridge, matching the dashboard's own lookup. */
export type GroupLookup = Record<
  string,
  { rooms: GroupOption[]; zones: GroupOption[] }
>;

/** Which side of the conversation a bubble belongs to. */
export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  /** Set once a reply carries a plan the user can review. */
  plan?: Plan;
  /** Set when a reply looked like a change but could not be used. */
  issue?: string;
};

/**
 * The agent may only touch one field per plan. Mixing a rename with a zone
 * move in one request makes the before/after table impossible to review, so
 * the parser rejects it rather than guessing which change was meant.
 */
export type PlanField = "name" | "room" | "zones";

/** Narrows a plan to part of the fleet, such as a single room. */
export type PlanFilter = {
  field: "room" | "zone" | "type" | "product" | "bridge";
  value: string;
};

export type Plan = {
  field: PlanField;
  /** Name templates, such as "{room} {product} {n}". */
  template?: string;
  /** Target room or zone name. */
  value?: string;
  /** Zone plans either add or remove membership. */
  action?: "add" | "remove";
  filter?: PlanFilter;
};

/** One reviewable row in the before/after table. */
export type Proposal = {
  key: string;
  row: DeviceRow;
  before: string;
  after: string;
  name?: string;
  roomId?: string | null;
  zoneIds?: string[];
};

export type AgentPhase =
  | "idle"
  | "unsupported"
  | "loading"
  | "ready"
  | "thinking"
  | "error";
