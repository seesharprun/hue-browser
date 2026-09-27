const { test }: typeof import("node:test") = require("node:test");
const assert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  discoveryErrorMessage,
  discoveryIssue,
  mergeBridgeCandidates,
}: typeof import("./discovery-result") = require("./discovery-result.ts");

test("deduplicates discovery results by verified bridge ID", () => {
  assert.deepEqual(
    mergeBridgeCandidates([
      [
        { id: "001788fffe123abc", address: "192.168.1.2" },
        { id: "001788fffe123abd", address: "192.168.1.3" },
      ],
      [
        { id: "001788fffe123abc", address: "192.168.1.4" },
        { id: "001788fffe123abe", address: "192.168.1.5" },
      ],
    ]),
    [
      { id: "001788fffe123abc", address: "192.168.1.2" },
      { id: "001788fffe123abd", address: "192.168.1.3" },
      { id: "001788fffe123abe", address: "192.168.1.5" },
    ],
  );
});

test("formats method-specific discovery failures without hiding bridges", () => {
  const result = {
    bridges: [{ id: "001788fffe123abc", address: "192.168.1.2" }],
    errors: [discoveryIssue("online", new Error("rate-limited"))],
  };
  assert.equal(discoveryErrorMessage(result), "online: rate-limited");
  assert.equal(result.bridges.length, 1);
});
