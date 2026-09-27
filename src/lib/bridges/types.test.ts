const { test }: typeof import("node:test") = require("node:test");
const assert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  applicationKeyFromResponse,
  bridgeCandidates,
  bridgeFromConfig,
  isBridgeId,
  isLocalAddress,
}: typeof import("./types") = require("./types.ts");
const {
  forgetBridge,
  loadBridges,
  saveBridge,
}: typeof import("./browser") = require("./browser.ts");
test("accepts local bridge addresses but not public or loopback targets", () => {
  for (const address of [
    "192.168.1.2",
    "10.0.0.1",
    "172.31.1.2",
    "100.64.1.1",
  ]) {
    assert.equal(isLocalAddress(address), true);
  }
  for (const address of [
    "8.8.8.8",
    "127.0.0.1",
    "localhost",
    "192.168.1.2:443",
  ]) {
    assert.equal(isLocalAddress(address), false);
  }
  assert.equal(isBridgeId("001788FFFE123ABC"), true);
  assert.equal(isBridgeId("bad-id"), false);
});

test("checks bridge identities and pairing responses", () => {
  const bridge = bridgeFromConfig(
    { bridgeid: "001788FFFE123ABC", name: "Living room" },
    "192.168.1.2",
  );
  assert.deepEqual(bridge, {
    id: "001788fffe123abc",
    name: "Living room",
    address: "192.168.1.2",
  });
  assert.throws(
    () => bridgeFromConfig({}, bridge.address),
    /invalid identity/i,
  );
  assert.equal(
    bridgeFromConfig({ bridgeid: bridge.id }, bridge.address).name,
    null,
  );
  assert.equal(
    applicationKeyFromResponse([{ success: { username: "0123456789abcdef" } }]),
    "0123456789abcdef",
  );
  assert.throws(
    () =>
      applicationKeyFromResponse([
        { error: { type: 101, description: "link button not pressed" } },
      ]),
    /Press the bridge button/,
  );
  assert.throws(() => applicationKeyFromResponse([{}]), /did not return/);
});

test("discovery exposes an ID and IP without fabricating a name", () => {
  assert.deepEqual(
    bridgeCandidates([
      { id: "001788FFFE123ABC", internalipaddress: "192.168.1.2", port: 443 },
    ]),
    [{ id: "001788fffe123abc", address: "192.168.1.2" }],
  );
  assert.throws(
    () =>
      bridgeCandidates([
        { id: "001788FFFE123ABC", internalipaddress: "8.8.8.8" },
      ]),
    /invalid data/,
  );
  assert.throws(
    () =>
      bridgeCandidates([
        { id: "001788FFFE123ABC", internalipaddress: "192.168.1.2" },
        { id: "001788fffe123abc", internalipaddress: "192.168.1.3" },
      ]),
    /duplicate bridges/,
  );
});

test("persists multiple bridges and replaces the same bridge by ID", () => {
  const entries = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
    },
  });
  const first = {
    id: "001788fffe123abc",
    address: "192.168.1.2",
    name: "First bridge",
    applicationKey: "0123456789abcdef",
  };
  const second = {
    ...first,
    id: "001788fffe123abd",
    address: "192.168.1.3",
  };
  try {
    assert.deepEqual(loadBridges(), []);
    const both = saveBridge(saveBridge([], first), second);
    assert.equal(both.length, 2);
    assert.deepEqual(loadBridges(), both);
    const moved = saveBridge(both, { ...first, address: "192.168.1.4" });
    assert.equal(moved.length, 2);
    assert.equal(
      moved.find((bridge) => bridge.id === first.id)?.address,
      "192.168.1.4",
    );
    assert.deepEqual(loadBridges(), moved);
    assert.deepEqual(forgetBridge(moved, second.id), [moved[1]]);
    entries.set("hue-browser-bridges", "{broken");
    assert.throws(() => loadBridges(), /Saved bridge data is invalid/);
  } finally {
    Reflect.deleteProperty(globalThis, "localStorage");
  }
});
