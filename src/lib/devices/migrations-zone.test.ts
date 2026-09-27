{
  const { test }: typeof import("node:test") = require("node:test");
  const assert: typeof import("node:assert/strict") = require("node:assert/strict");
  const {
    planMigration,
  }: typeof import("./migrations") = require("./migrations.ts");

  const DEVICE_A = "11111111-1111-1111-1111-111111111111";
  const LIGHT_A = "22222222-2222-2222-2222-222222222222";
  const DEVICE_B = "33333333-3333-3333-3333-333333333333";
  const LIGHT_B = "44444444-4444-4444-4444-444444444444";
  const SOURCE = "55555555-5555-5555-5555-555555555555";

  test("plans zone emptying through light services", () => {
    const plan = planMigration(
      [
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
          type: "zone",
          metadata: { name: "Old zone" },
          children: [
            { rid: LIGHT_A, rtype: "light" },
            { rid: LIGHT_B, rtype: "light" },
          ],
        },
      ],
      { groupType: "zone", sourceId: SOURCE, destinationId: null },
    );
    assert.deepEqual(
      plan.map(({ id, name }) => ({ id, name })),
      [
        { id: DEVICE_A, name: "Pendant" },
        { id: DEVICE_B, name: "Lamp" },
      ],
    );
    assert.equal(
      plan.at(-1)?.updates.at(-1)?.path,
      `/clip/v2/resource/zone/${SOURCE}`,
    );
    assert.deepEqual(plan.at(-1)?.updates.at(-1)?.body, { children: [] });
  });
}
