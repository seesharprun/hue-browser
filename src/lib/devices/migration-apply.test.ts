{
  const { test }: typeof import("node:test") = require("node:test");
  const assert: typeof import("node:assert/strict") = require("node:assert/strict");
  const {
    applyMigration,
  }: typeof import("./migration-apply") = require("./migration-apply.ts");

  const DEVICE_A = "11111111-1111-1111-1111-111111111111";
  const DEVICE_B = "33333333-3333-3333-3333-333333333333";
  const DEVICE_C = "44444444-4444-4444-4444-444444444444";

  test("reports moved, failed, and skipped devices", async () => {
    let calls = 0;
    const results = await applyMigration(
      [
        { id: DEVICE_A, name: "Pendant", updates: [{ path: "a", body: {} }] },
        { id: DEVICE_B, name: "Lamp", updates: [{ path: "b", body: {} }] },
        { id: DEVICE_C, name: "Sconce", updates: [{ path: "c", body: {} }] },
      ],
      async () => {
        calls += 1;
        if (calls === 2) throw new Error("No reply");
      },
    );
    assert.deepEqual(results, [
      { id: DEVICE_A, name: "Pendant", status: "moved" },
      { id: DEVICE_B, name: "Lamp", status: "failed", error: "No reply" },
      { id: DEVICE_C, name: "Sconce", status: "skipped" },
    ]);
  });
}
