const { test: testGroups }: typeof import("node:test") = require("node:test");
const groupsAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  collectGroups,
  groupRecord,
  readResources,
  reference,
  text,
}: typeof import("./groups") = require("./groups.ts");

const groupResources = [
  {
    id: "room-1",
    type: "room",
    metadata: { name: "Living room" },
    children: [{ rid: "device-1", rtype: "device" }],
  },
  {
    id: "zone-1",
    type: "zone",
    metadata: {},
    children: [
      { rid: "light-1", rtype: "light" },
      { rid: "device-1", rtype: "device" },
      { rtype: "light" },
    ],
  },
  { id: "scene-1", type: "scene", metadata: { name: "Dinner" } },
];

testGroups("reads resources and extracts safe text and references", () => {
  groupsAssert.equal(text("Lamp"), "Lamp");
  groupsAssert.equal(text(null), "");
  groupsAssert.equal(reference({ rid: "abc", rtype: "device" }), "abc");
  groupsAssert.equal(reference({ rtype: "device" }), null);
  groupsAssert.equal(
    readResources({ errors: [], data: groupResources }),
    groupResources,
  );
  groupsAssert.throws(
    () => readResources({ errors: [{}], data: [] }),
    /could not list/i,
  );
});

testGroups("collects rooms and zones with fallbacks", () => {
  groupsAssert.deepEqual(collectGroups(groupResources, "room"), [
    { id: "room-1", name: "Living room", children: ["device-1"] },
  ]);
  groupsAssert.deepEqual(collectGroups(groupResources, "zone"), [
    {
      id: "zone-1",
      name: "Unnamed zone",
      children: ["light-1", "device-1"],
    },
  ]);
  groupsAssert.throws(
    () => groupRecord({ id: "broken", children: [] }, "room"),
    /invalid room data/i,
  );
});
