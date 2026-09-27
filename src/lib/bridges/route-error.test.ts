const {
  test: testRouteError,
}: typeof import("node:test") = require("node:test");
const routeErrorAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  bridgeFailure,
  bridgeResponse,
}: typeof import("./route-error") = require("./route-error.ts");
const {
  discoveryError: routeDiscoveryError,
}: typeof import("./discovery-error") = require("./discovery-error.ts");
const { BridgeError }: typeof import("./types") = require("./types.ts");

testRouteError("returns no-store JSON responses", async () => {
  const response = bridgeResponse({ ok: true }, 201);
  routeErrorAssert.equal(response.status, 201);
  routeErrorAssert.equal(response.headers.get("cache-control"), "no-store");
  routeErrorAssert.deepEqual(await response.json(), { ok: true });
});

testRouteError("maps bridge errors and unexpected failures", async () => {
  const rateLimited = bridgeFailure(
    new BridgeError(
      routeDiscoveryError(
        new Response(null, { status: 520, headers: { "retry-after": "45" } }),
      ),
      502,
    ),
  );
  routeErrorAssert.equal(rateLimited.status, 502);
  routeErrorAssert.match(
    (await rateLimited.json()).error,
    /HTTP 520.*45 seconds/,
  );

  const originalConsoleError = console.error;
  console.error = () => undefined;
  try {
    const response = bridgeFailure(new Error("boom"));
    routeErrorAssert.equal(response.status, 500);
    routeErrorAssert.deepEqual(await response.json(), {
      error: "Something went wrong. Try again.",
    });
  } finally {
    console.error = originalConsoleError;
  }
});
