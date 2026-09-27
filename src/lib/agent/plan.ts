import type { Plan, PlanField, PlanFilter } from "./types.ts";

const FIELDS: PlanField[] = ["name", "room", "zones"];
const FILTERS = ["room", "zone", "type", "product", "bridge"];

/** Words small models reach for in place of the three field names. */
const FIELD_ALIASES: Record<string, PlanField> = {
  rename: "name",
  names: "name",
  naming: "name",
  label: "name",
  title: "name",
  rooms: "room",
  move: "room",
  group: "room",
  zone: "zones",
  zoning: "zones",
};

/** Accepts the model's near-misses for a field name. */
function readField(value: unknown): PlanField | null {
  const raw = String(value ?? "")
    .toLowerCase()
    .trim();
  if (FIELDS.includes(raw as PlanField)) return raw as PlanField;
  return FIELD_ALIASES[raw] ?? null;
}

/** Pulls the first balanced JSON object out of free-form model output. */
export function extractJson(text: string): string | null {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  for (let index = start; index < text.length; index += 1) {
    if (text[index] === "{") depth += 1;
    if (text[index] === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }
  return null;
}

/**
 * Small models reach for Python-ish or prose-ish JSON. These are formatting
 * slips rather than different intent, so they are repaired before parsing.
 */
function repair(json: string) {
  return json
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/'/g, '"')
    .replace(/,\s*([}\]])/g, "$1");
}

function readFilter(value: unknown): PlanFilter | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  const field = String(raw.field ?? "")
    .toLowerCase()
    .replace(/s$/, "");
  const match = String(raw.value ?? "").trim();
  if (!FILTERS.includes(field) || match.length === 0) return undefined;
  return { field: field as PlanFilter["field"], value: match };
}

const NO_JSON = "no-json";

type Review = { plan: Plan; issue: null } | { plan: null; issue: string };

/**
 * Small models drift, so a plan is only accepted when every part it needs is
 * present. The reason for a rejection is kept so the chat can say what went
 * wrong instead of silently dropping the reply.
 */
function review(text: string): Review {
  const json = extractJson(text);
  if (!json) {
    // An opening brace with no balanced close means the reply was cut off
    // mid-change, which is different from ordinary conversation.
    if (text.includes("{"))
      return {
        plan: null,
        issue: "That change was cut off before it finished. Try asking again.",
      };
    return { plan: null, issue: NO_JSON };
  }

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(repair(json)) as Record<string, unknown>;
  } catch {
    return {
      plan: null,
      issue: "I could not read that change. Try asking again.",
    };
  }

  const field = readField(raw.field);
  if (!field)
    return {
      plan: null,
      issue:
        "I can only change a name, a room, or a zone. Which of those did you mean?",
    };
  // Two fields in one object is the bulk edit the agent is not allowed to do.
  if (field === "name" && raw.template !== undefined && raw.value !== undefined)
    return {
      plan: null,
      issue:
        "I can only change one thing at a time. Shall we start with the names?",
    };
  const filter = readFilter(raw.filter);

  if (field === "name") {
    // A rename carries its pattern under any of several plausible keys.
    const template = String(
      raw.template ?? raw.value ?? raw.name ?? raw.pattern ?? "",
    ).trim();
    if (template.length === 0)
      return {
        plan: null,
        issue:
          "That rename is missing a name pattern. What should the names look like?",
      };
    // A template with no token renames every match to the same string.
    if (!template.includes("{"))
      return {
        plan: null,
        issue:
          "That name has no {n} or {room} in it, so every device would end up with the same name.",
      };
    return { plan: { field, template, filter }, issue: null };
  }

  const value = String(raw.value ?? "").trim();
  if (value.length === 0)
    return {
      plan: null,
      issue:
        "That change is missing a room or zone name. Which one did you mean?",
    };
  if (field === "room") return { plan: { field, value, filter }, issue: null };

  const action = raw.action === "remove" ? "remove" : "add";
  return { plan: { field, value, action, filter }, issue: null };
}

export function parsePlan(text: string): Plan | null {
  return review(text).plan;
}

/**
 * Explains why a reply that looked like a change was not offered for review.
 * Returns null for ordinary conversation, which carries no JSON at all.
 */
export function planIssue(text: string): string | null {
  const issue = review(text).issue;
  return issue === NO_JSON ? null : issue;
}

/** Plain-language summary shown on the review button. */
export function describePlan(plan: Plan): string {
  const scope = plan.filter
    ? ` where ${plan.filter.field} is ${plan.filter.value}`
    : "";
  if (plan.field === "name") return `Rename to ${plan.template}${scope}`;
  // An unscoped move only ever reaches devices with no room, so the button
  // has to say that rather than imply the whole fleet is about to move.
  if (plan.field === "room")
    return `Move into ${plan.value}${scope || " where room is Unassigned"}`;
  const verb = plan.action === "remove" ? "Remove from" : "Add to";
  return `${verb} zone ${plan.value}${scope}`;
}
