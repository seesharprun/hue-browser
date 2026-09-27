const {
  test: testApiRoutes,
}: typeof import("node:test") = require("node:test");
const apiRoutesAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  POST: postCommandRoute,
}: typeof import("./command/route") = require("./command/route.ts");
const {
  POST: postDevicesRoute,
}: typeof import("./devices/route") = require("./devices/route.ts");
const {
  GET: getDiscoverRoute,
}: typeof import("./discover/route") = require("./discover/route.ts");
const {
  POST: postEditRoute,
}: typeof import("./edit/route") = require("./edit/route.ts");
const {
  POST: postIdentifyRoute,
}: typeof import("./identify/route") = require("./identify/route.ts");
const {
  POST: postPairRoute,
}: typeof import("./pair/route") = require("./pair/route.ts");

const apiMalformedRequest = () =>
  new Request("http://localhost/api/bridges/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{broken",
  });

const apiMissingAddressRequest = () =>
  new Request("http://localhost/api/bridges/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });

testApiRoutes(
  "POST routes reject malformed JSON with the validation status",
  async () => {
    for (const route of [
      postCommandRoute,
      postDevicesRoute,
      postEditRoute,
      postIdentifyRoute,
      postPairRoute,
    ]) {
      const response = await route(apiMalformedRequest());
      apiRoutesAssert.equal(response.status, 400);
      apiRoutesAssert.deepEqual(await response.json(), {
        error: "Send valid JSON.",
      });
    }
  },
);

testApiRoutes("POST routes reject missing local bridge addresses", async () => {
  for (const route of [
    postCommandRoute,
    postDevicesRoute,
    postEditRoute,
    postIdentifyRoute,
    postPairRoute,
  ]) {
    const response = await route(apiMissingAddressRequest());
    apiRoutesAssert.equal(response.status, 400);
    apiRoutesAssert.match((await response.json()).error, /local IPv4/);
  }
});

testApiRoutes("discover route maps discovery failures", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(null, {
      status: 429,
      headers: { "retry-after": "30" },
    })) as typeof fetch;
  try {
    const response = await getDiscoverRoute();
    apiRoutesAssert.equal(response.status, 429);
    apiRoutesAssert.match(
      (await response.json()).error,
      /rate-limited.*30 seconds/i,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
