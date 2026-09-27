const {
  test: testTransport,
}: typeof import("node:test") = require("node:test");
const transportAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  bridgeRequestOptions,
}: typeof import("./transport-options") = require("./transport-options.ts");

testTransport("builds secure bridge request options and headers", () => {
  const options = bridgeRequestOptions(
    "192.168.1.2",
    "/clip/v2/resource",
    "PUT",
    "001788fffe123abc",
    JSON.stringify({ on: { on: true } }),
    "0123456789abcdef",
  );
  transportAssert.equal(options.hostname, "192.168.1.2");
  transportAssert.equal(options.port, 443);
  transportAssert.equal(options.path, "/clip/v2/resource");
  transportAssert.equal(options.method, "PUT");
  transportAssert.equal(options.rejectUnauthorized, true);
  transportAssert.equal(options.headers["content-type"], "application/json");
  transportAssert.equal(
    options.headers["hue-application-key"],
    "0123456789abcdef",
  );
  transportAssert.equal(typeof options.headers["content-length"], "number");
  transportAssert.equal(typeof options.checkServerIdentity, "function");
});

testTransport("omits body and application-key headers when absent", () => {
  const options = bridgeRequestOptions("192.168.1.2", "/api/config", "GET");
  transportAssert.deepEqual(options.headers, {});
});
