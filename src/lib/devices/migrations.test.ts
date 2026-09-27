const { test }: typeof import("node:test") = require("node:test");
const assert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  applyMigration,
  isMigrationRequest,
  planMigration,
}: typeof import("./migrations") = require("./migrations.ts");

const DEVICE_A = "11111111-1111-1111-1111-111111111111";
const LIGHT_A = "22222222-2222-2222-2222-222222222222";
const DEVICE_B = "33333333-3333-3333-3333-333333333333";
const LIGHT_B = "44444444-4444-4444-4444-444444444444";
const SOURCE = "55555555-5555-5555-5555-555555555555";
const TARGET = "66666666-6666-6666-6666-666666666666";

const resources = [
  {
    id: DEVICE_A,
    type: "device",
    metadata: { name: "Pendant" },
    services: [{ rid: LIGHT_A, rtype: "light" }],
  },
  {
    id: DEVICE_B,
    type: "device",
    metadata: { name: "Lamp" },
    services: [{ rid: LIGHT_B, rtype: "light" }],
  },
  {
    id: SOURCE,
    type: "room",
    metadata: { name: "Old room" },
    children: [
      { rid: DEVICE_A, rtype: "device" },
      { rid: DEVICE_B, rtype: "device" },
    ],
  },
  {
    id: TARGET,
    type: "room",
    metadata: { name: "New room" },
    children: [],
  },
  {
    id: SOURCE,
    type: "zone",
    metadata: { name: "Old zone" },
    children: [
      { rid: LIGHT_A, rtype: "light" },
      { rid: LIGHT_B, rtype: "light" },
    ],
  },
  {
    id: TARGET,
    type: "zone",
    metadata: { name: "New zone" },
    children: [],
  },
];

test("validates migration requests", () => {
  assert.equal(
    isMigrationRequest({ groupType: "room", sourceId: SOURCE, destinationId: null }),
    true,
  );
  assert.equal(
    isMigrationRequest({ groupType: "zone", sourceId: SOURCE, destinationId: TARGET }),
    true,
  );
  assert.equal(isMigrationRequest({ groupType: "device", sourceId: SOURCE }), false);
  assert.equal(
    isMigrationRequest({ groupType: "room", sourceId: "nope", destinationId: null }),
    false,
  );
});

test("plans room migration with cumulative group child lists", () => {
  assert.deepEqual(planMigration(resources, {
    groupType: "room",
    sourceId: SOURCE,
    destinationId: TARGET,
  }), [
    {
      id: DEVICE_A,
      name: "Pendant",
      updates: [
        {
          path: `/clip/v2/resource/room/${SOURCE}`,
          body: { children: [{ rid: DEVICE_B, rtype: "device" }] },
        },
        {
          path: `/clip/v2/resource/room/${TARGET}`,
          body: { children: [{ rid: DEVICE_A, rtype: "device" }] },
        },
      ],
    },
    {
      id: DEVICE_B,
      name: "Lamp",
      updates: [
        { path: `/clip/v2/resource/room/${SOURCE}`, body: { children: [] } },
        {
          path: `/clip/v2/resource/room/${TARGET}`,
          body: {
            children: [
              { rid: DEVICE_A, rtype: "device" },
              { rid: DEVICE_B, rtype: "device" },
            ],
          },
        },
      ],
    },
  ]);
});

test("plans zone emptying through light services", () => {
  const plan = planMigration(resources, {
    groupType: "zone",
    sourceId: SOURCE,
    destinationId: null,
  });
  assert.deepEqual(plan.map(({ id, name }) => ({ id, name })), [
    { id: DEVICE_A, name: "Pendant" },
    { id: DEVICE_B, name: "Lamp" },
  ]);
  assert.equal(plan.at(-1)?.updates.at(-1)?.path, `/clip/v2/resource/zone/${SOURCE}`);
  assert.deepEqual(plan.at(-1)?.updates.at(-1)?.body, { children: [] });
});

test("reports moved, failed, and skipped devices", async () => {
  const plan = planMigration(resources, {
    groupType: "room",
    sourceId: SOURCE,
    destinationId: TARGET,
  });
  let calls = 0;
  const results = await applyMigration(plan, async () => {
    calls += 1;
    if (calls === 3) throw new Error("No reply");
  });
  assert.deepEqual(results, [
    { id: DEVICE_A, name: "Pendant", status: "moved" },
    { id: DEVICE_B, name: "Lamp", status: "failed", error: "No reply" },
  ]);
});
