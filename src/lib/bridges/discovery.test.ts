const {
  test: testDiscoveryRoute,
}: typeof import("node:test") = require("node:test");
const discoveryRouteAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  discoverBridges: discoverBridgeCandidates,
}: typeof import("./discovery") = require("./discovery.ts");

async function withDiscoveryFetch(
  response: Response | Error,
  run: () => Promise<void>,
) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    if (response instanceof Error) throw response;
    return response;
  }) as typeof fetch;
  try {
    await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

testDiscoveryRoute("parses discovery results", async () => {
  await withDiscoveryFetch(
    new Response(
      JSON.stringify([
        { id: "001788FFFE123ABC", internalipaddress: "192.168.1.2" },
      ]),
    ),
    async () => {
      discoveryRouteAssert.deepEqual(await discoverBridgeCandidates(), [
        { id: "001788fffe123abc", address: "192.168.1.2" },
      ]);
    },
  );
});

testDiscoveryRoute(
  "maps service and malformed discovery failures",
  async () => {
    const originalConsoleError = console.error;
    console.error = () => undefined;
    try {
      await withDiscoveryFetch(
        new Response(null, { status: 429 }),
        async () => {
          await discoveryRouteAssert.rejects(
            () => discoverBridgeCandidates(),
            /rate-limited.*bridge IP address/i,
          );
        },
      );
      await withDiscoveryFetch(new Response("not-json"), async () => {
        await discoveryRouteAssert.rejects(
          () => discoverBridgeCandidates(),
          /invalid data/i,
        );
      });
      await withDiscoveryFetch(new Error("offline"), async () => {
        await discoveryRouteAssert.rejects(
          () => discoverBridgeCandidates(),
          /unavailable/i,
        );
      });
    } finally {
      console.error = originalConsoleError;
    }
  },
);
