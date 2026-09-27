import type { DeviceRow } from "../devices/types.ts";
import type { GroupLookup } from "./types.ts";

const unique = (values: string[]) =>
  [...new Set(values.filter(Boolean))].sort();

/**
 * A 1B model has a small context window, so the fleet is summarised into
 * counts and names rather than listing every device.
 */
export function buildContext(rows: DeviceRow[], groups: GroupLookup) {
  const rooms = unique(
    Object.values(groups).flatMap((g) => g.rooms.map((r) => r.name)),
  );
  const zones = unique(
    Object.values(groups).flatMap((g) => g.zones.map((z) => z.name)),
  );
  const unassigned = rows.filter((row) => !row.roomId).length;

  return [
    `Devices: ${rows.length}`,
    `Rooms: ${rooms.join(", ") || "none"}`,
    `Zones: ${zones.join(", ") || "none"}`,
    `Devices with no room: ${unassigned}`,
  ].join("\n");
}

/**
 * The agent designs a scheme in conversation and then emits one small plan.
 * Expanding that plan across the fleet is done by ordinary code, so the model
 * never has to write out a change for every device.
 *
 * Every rule here earned its place by fixing a failure measured against a
 * suite of phrasings. Small models invent a "filter" they were never asked
 * for, reach for field names that do not exist, and paste whole room lists
 * into "value", so each of those is ruled out in as few words as possible.
 */
export function systemPrompt(context: string) {
  return `You turn a request about Philips Hue devices into one JSON change.

${context}

Reply with one short sentence, then one JSON object on the next line.

"field" must be exactly one of: "name", "room", "zones". Never anything else.
"value" must be exactly one room or zone name from the lists above.
The "filter" key decides which devices are changed, so it has to match the
request exactly. If the request names one room, you must include
{"field":"room","value":"<that room>"}. If it says the devices with no room,
or the unassigned ones, you must include
{"field":"room","value":"Unassigned"}. If it says every, all, or everything,
you must leave "filter" out. Never include any other kind of filter.
A name template must contain {n} or another {token}. The tokens you may use
are {room} {zone} {product} {type} {bridge} {model} {name} {n}, and {n} counts
up from 1 within each room.
Never put two changes in one reply. If they are still deciding, or you cannot
tell which devices they mean, ask a short question and write no JSON.`;
}

/**
 * Worked turns teach the shape far better than examples written into the
 * prompt itself, which small models copy back out word for word.
 */
export const examples: { role: string; content: string }[] = [
  {
    role: "user",
    content: "Just the Office ones should be called Desk and a number.",
  },
  {
    role: "assistant",
    content:
      'I will rename only the Office devices.\n{"field":"name","template":"Desk {n}","filter":{"field":"room","value":"Office"}}',
  },
  {
    role: "user",
    content: "Name everything after its room and a number.",
  },
  {
    role: "assistant",
    content:
      'I will rename every device that way.\n{"field":"name","template":"{room} {n}"}',
  },
  {
    role: "user",
    content: "Rename all the lights to the room, the product and a number.",
  },
  {
    role: "assistant",
    content:
      'I will rename every device that way.\n{"field":"name","template":"{room} {product} {n}"}',
  },
  {
    role: "user",
    content: "Only the Hallway ones, name them Sconce and a number. Do it.",
  },
  {
    role: "assistant",
    content:
      'I will rename only the Hallway devices.\n{"field":"name","template":"Sconce {n}","filter":{"field":"room","value":"Hallway"}}',
  },
  {
    role: "user",
    content: "Move the ones with no room into the Garage room. Do it.",
  },
  {
    role: "assistant",
    content:
      'I will move them into Garage.\n{"field":"room","value":"Garage","filter":{"field":"room","value":"Unassigned"}}',
  },
  {
    role: "user",
    content: "Add them to the Evening zone.",
  },
  {
    role: "assistant",
    content:
      'I will add them to Evening.\n{"field":"zones","value":"Evening","action":"add"}',
  },
  {
    role: "user",
    content: "Take the lights out of the Outdoor zone. Do it.",
  },
  {
    role: "assistant",
    content:
      'I will remove them from Outdoor.\n{"field":"zones","value":"Outdoor","action":"remove"}',
  },
];
