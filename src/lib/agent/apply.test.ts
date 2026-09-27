const { test: testApply }: typeof import("node:test") = require("node:test");
const applyAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  buildProposals,
  expand,
}: typeof import("./apply") = require("./apply.ts");

type Row = import("../devices/types").DeviceRow;

const row = (overrides: Partial<Row> = {}): Row =>
  ({
    id: "light-1",
    bridgeId: "bridge-1",
    bridgeName: "Hall",
    name: "Pendant",
    product: "Hue white",
    model: "LCT015",
    type: "light",
    room: "Kitchen",
    roomId: "room-1",
    zones: [],
    zoneIds: [],
    services: [],
    manufacturer: "Signify",
    software: "1.0",
    hardware: "1.0",
    mac: "00:11",
    light: { id: "svc-1", on: true, color: true },
    ...overrides,
  }) as Row;

const groups = {
  "bridge-1": {
    devices: [],
    rooms: [
      { id: "room-1", name: "Kitchen" },
      { id: "room-2", name: "Lounge" },
    ],
    zones: [{ id: "zone-a", name: "Downstairs" }],
  },
};

testApply("numbers devices per room rather than across the fleet", () => {
  const rows = [
    row({ id: "a", name: "One", room: "Kitchen" }),
    row({ id: "b", name: "Two", room: "Kitchen" }),
    row({ id: "c", name: "Three", room: "Lounge", roomId: "room-2" }),
  ];
  const out = buildProposals(
    { field: "name", template: "{room} Light {n}" },
    rows,
    groups,
  );
  applyAssert.deepEqual(
    out.map((item) => item.after),
    ["Kitchen Light 1", "Kitchen Light 2", "Lounge Light 1"],
  );
});

testApply("skips devices that already match the scheme", () => {
  const rows = [
    row({ id: "a", name: "Kitchen 1" }),
    row({ id: "b", name: "x" }),
  ];
  const out = buildProposals(
    { field: "name", template: "{room} {n}" },
    rows,
    groups,
  );
  applyAssert.equal(out.length, 1);
  applyAssert.equal(out[0].row.id, "b");
});

testApply("drops a rename that would exceed the bridge name limit", () => {
  const out = buildProposals(
    { field: "name", template: `${"x".repeat(40)}{n}` },
    [row()],
    groups,
  );
  applyAssert.equal(out.length, 0);
});

testApply("only touches devices inside the filter", () => {
  const rows = [
    row({ id: "a", room: "Kitchen" }),
    row({ id: "b", room: "Lounge", roomId: "room-2" }),
  ];
  const out = buildProposals(
    {
      field: "name",
      template: "{room} {n}",
      filter: { field: "room", value: "kitchen" },
    },
    rows,
    groups,
  );
  applyAssert.equal(out.length, 1);
  applyAssert.equal(out[0].row.id, "a");
});

testApply("moves a device into another room and records the id", () => {
  const out = buildProposals(
    {
      field: "room",
      value: "Lounge",
      filter: { field: "room", value: "Kitchen" },
    },
    [row()],
    groups,
  );
  applyAssert.equal(out[0].roomId, "room-2");
  applyAssert.equal(out[0].before, "Kitchen");
  applyAssert.equal(out[0].after, "Lounge");
});

testApply("ignores a room that does not exist on the bridge", () => {
  const out = buildProposals(
    { field: "room", value: "Cellar" },
    [row()],
    groups,
  );
  applyAssert.equal(out.length, 0);
});

testApply("never puts a device without a light into a zone", () => {
  const out = buildProposals(
    { field: "zones", value: "Downstairs", action: "add" },
    [row({ light: null })],
    groups,
  );
  applyAssert.equal(out.length, 0);
});

testApply("adds and removes zone membership", () => {
  const added = buildProposals(
    { field: "zones", value: "Downstairs", action: "add" },
    [row()],
    groups,
  );
  applyAssert.deepEqual(added[0].zoneIds, ["zone-a"]);
  applyAssert.equal(added[0].before, "None");

  const removed = buildProposals(
    { field: "zones", value: "Downstairs", action: "remove" },
    [row({ zones: ["Downstairs"], zoneIds: ["zone-a"] })],
    groups,
  );
  applyAssert.deepEqual(removed[0].zoneIds, []);
  applyAssert.equal(removed[0].after, "None");
});

testApply("skips zone changes that would be a no-op", () => {
  const out = buildProposals(
    { field: "zones", value: "Downstairs", action: "add" },
    [row({ zones: ["Downstairs"], zoneIds: ["zone-a"] })],
    groups,
  );
  applyAssert.equal(out.length, 0);
});

testApply("leaves unknown tokens untouched and tidies spacing", () => {
  applyAssert.equal(expand("{room}  {nope} {n}", row(), 3), "Kitchen {nope} 3");
});

testApply("an unscoped room move only reaches devices with no room", () => {
  const rows = [
    row({ id: "a", room: "Kitchen", roomId: "room-1" }),
    row({ id: "b", room: "", roomId: null }),
  ];
  const out = buildProposals({ field: "room", value: "Lounge" }, rows, groups);
  applyAssert.equal(out.length, 1);
  applyAssert.equal(out[0].before, "Unassigned");
  applyAssert.equal(out[0].roomId, "room-2");
});

testApply("a room move that names a room still reaches that room", () => {
  const rows = [
    row({ id: "a", room: "Kitchen", roomId: "room-1" }),
    row({ id: "b", room: "", roomId: null }),
  ];
  const out = buildProposals(
    {
      field: "room",
      value: "Lounge",
      filter: { field: "room", value: "Kitchen" },
    },
    rows,
    groups,
  );
  applyAssert.equal(out.length, 1);
  applyAssert.equal(out[0].before, "Kitchen");
});
