const { test: testEdits }: typeof import("node:test") = require("node:test");
const editAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  isEditRequest,
  planEdits,
}: typeof import("./edits") = require("./edits.ts");

const DEVICE = "11111111-1111-1111-1111-111111111111";
const LIGHT = "22222222-2222-2222-2222-222222222222";
const KITCHEN = "33333333-3333-3333-3333-333333333333";
const OFFICE = "44444444-4444-4444-4444-444444444444";
const EVENING = "55555555-5555-5555-5555-555555555555";
const MORNING = "66666666-6666-6666-6666-666666666666";

const resources = [
  {
    id: DEVICE,
    type: "device",
    services: [{ rid: LIGHT, rtype: "light" }],
  },
  {
    id: KITCHEN,
    type: "room",
    metadata: { name: "Kitchen" },
    children: [{ rid: DEVICE, rtype: "device" }],
  },
  {
    id: OFFICE,
    type: "room",
    metadata: { name: "Office" },
    children: [],
  },
  {
    id: EVENING,
    type: "zone",
    metadata: { name: "Evening" },
    children: [{ rid: LIGHT, rtype: "light" }],
  },
  {
    id: MORNING,
    type: "zone",
    metadata: { name: "Morning" },
    children: [],
  },
];

testEdits("validates edit requests", () => {
  editAssert.equal(isEditRequest({ deviceId: DEVICE }), true);
  editAssert.equal(isEditRequest({ deviceId: DEVICE, roomId: null }), true);
  editAssert.equal(isEditRequest({ deviceId: "nope" }), false);
  editAssert.equal(isEditRequest({ deviceId: DEVICE, name: "  " }), false);
  editAssert.equal(
    isEditRequest({ deviceId: DEVICE, name: "x".repeat(33) }),
    false,
  );
  editAssert.equal(
    isEditRequest({ deviceId: DEVICE, zoneIds: ["nope"] }),
    false,
  );
});

testEdits("renames a device and trims the name", () => {
  editAssert.deepEqual(
    planEdits(resources, { deviceId: DEVICE, name: " Hi " }),
    [
      {
        path: `/clip/v2/resource/device/${DEVICE}`,
        body: { metadata: { name: "Hi" } },
      },
    ],
  );
});

testEdits("moves a device between rooms and to unassigned", () => {
  editAssert.deepEqual(
    planEdits(resources, { deviceId: DEVICE, roomId: OFFICE }),
    [
      {
        path: `/clip/v2/resource/room/${KITCHEN}`,
        body: { children: [] },
      },
      {
        path: `/clip/v2/resource/room/${OFFICE}`,
        body: { children: [{ rid: DEVICE, rtype: "device" }] },
      },
    ],
  );
  editAssert.deepEqual(
    planEdits(resources, { deviceId: DEVICE, roomId: null }),
    [{ path: `/clip/v2/resource/room/${KITCHEN}`, body: { children: [] } }],
  );
  // Staying in the same room is not a change.
  editAssert.deepEqual(
    planEdits(resources, { deviceId: DEVICE, roomId: KITCHEN }),
    [],
  );
});

testEdits("adds and removes zone membership through the light service", () => {
  editAssert.deepEqual(
    planEdits(resources, { deviceId: DEVICE, zoneIds: [MORNING] }),
    [
      { path: `/clip/v2/resource/zone/${EVENING}`, body: { children: [] } },
      {
        path: `/clip/v2/resource/zone/${MORNING}`,
        body: { children: [{ rid: LIGHT, rtype: "light" }] },
      },
    ],
  );
  editAssert.deepEqual(
    planEdits(resources, { deviceId: DEVICE, zoneIds: [EVENING] }),
    [],
  );
});

testEdits("rejects unknown devices, rooms, and zones", () => {
  editAssert.throws(
    () => planEdits(resources, { deviceId: LIGHT }),
    /no longer on this bridge/i,
  );
  editAssert.throws(
    () => planEdits(resources, { deviceId: DEVICE, roomId: EVENING }),
    /room is no longer/i,
  );
  editAssert.throws(
    () => planEdits(resources, { deviceId: DEVICE, zoneIds: [KITCHEN] }),
    /zone is no longer/i,
  );
});

testEdits("refuses zones for a device without a light", () => {
  const sensor = [
    { id: DEVICE, type: "device", services: [{ rid: LIGHT, rtype: "button" }] },
    { id: MORNING, type: "zone", metadata: { name: "Morning" }, children: [] },
  ];
  editAssert.throws(
    () => planEdits(sensor, { deviceId: DEVICE, zoneIds: [MORNING] }),
    /cannot join a zone/i,
  );
});
