const {
  test: testDiscovery,
}: typeof import("node:test") = require("node:test");
const discoveryAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  discoveryError,
}: typeof import("./discovery-error") = require("./discovery-error.ts");

testDiscovery(
  "discovery reports Retry-After on rate limits and other service errors",
  () => {
    for (const [status, retryAfter, message] of [
      [429, "231", /rate-limited.*about 4 minutes/i],
      [520, "45", /HTTP 520.*in 45 seconds/i],
      [
        520,
        new Date(Date.now() + 120_000).toUTCString(),
        /HTTP 520.*about 2 minutes/i,
      ],
      [520, "not a date", /HTTP 520\. Enter a bridge IP address/i],
      [520, null, /HTTP 520\. Enter a bridge IP address/i],
      [429, null, /rate-limited.*Wait a while/i],
    ] as const) {
      const response = new Response(null, {
        status,
        headers: retryAfter ? { "retry-after": retryAfter } : {},
      });
      discoveryAssert.match(discoveryError(response), message);
    }
  },
);
