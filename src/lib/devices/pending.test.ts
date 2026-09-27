const { test: testPending }: typeof import("node:test") = require("node:test");
const pendingAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  original,
  rowKey,
  same,
  valid,
}: typeof import("./pending") = require("./pending.ts");

const draft = (overrides: Partial<ReturnType<typeof original>> = {}) => ({
  name: "Pendant",
  roomId: "room-1",
  zoneIds: ["zone-a", "zone-b"],
  ...overrides,
});

testPending(
  "keys a row by bridge and device so ids collide across bridges",
  () => {
    pendingAssert.equal(
      rowKey({ bridgeId: "bridge-1", id: "light-1" }),
      "bridge-1:light-1",
    );
    pendingAssert.notEqual(
      rowKey({ bridgeId: "bridge-1", id: "light-1" }),
      rowKey({ bridgeId: "bridge-2", id: "light-1" }),
    );
  },
);

testPending("reads the bridge's own values as the starting draft", () => {
  pendingAssert.deepEqual(
    original({ name: "Sink", roomId: null, zoneIds: [] }),
    {
      name: "Sink",
      roomId: null,
      zoneIds: [],
    },
  );
});

testPending("treats a reordered zone selection as unchanged", () => {
  pendingAssert.ok(same(draft(), draft({ zoneIds: ["zone-b", "zone-a"] })));
});

testPending("detects added, removed, and swapped zones", () => {
  pendingAssert.ok(!same(draft(), draft({ zoneIds: ["zone-a"] })));
  pendingAssert.ok(
    !same(draft(), draft({ zoneIds: ["zone-a", "zone-b", "zone-c"] })),
  );
  pendingAssert.ok(!same(draft(), draft({ zoneIds: ["zone-a", "zone-c"] })));
});

testPending(
  "detects a renamed device and a moved room, including unassigning",
  () => {
    pendingAssert.ok(!same(draft(), draft({ name: "Pendant " })));
    pendingAssert.ok(!same(draft(), draft({ roomId: "room-2" })));
    pendingAssert.ok(!same(draft(), draft({ roomId: null })));
  },
);

testPending("rejects a name that is blank, whitespace, or too long", () => {
  pendingAssert.ok(!valid(draft({ name: "" })));
  pendingAssert.ok(!valid(draft({ name: "   " })));
  pendingAssert.ok(!valid(draft({ name: "x".repeat(33) })));
});

testPending("accepts a name that fits once trimmed", () => {
  pendingAssert.ok(valid(draft({ name: "  Pendant  " })));
  pendingAssert.ok(valid(draft({ name: "x".repeat(32) })));
});
