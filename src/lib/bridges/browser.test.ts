const { test: testBrowser }: typeof import("node:test") = require("node:test");
const browserAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  editDevice,
  isDeviceRow,
  isGroupOptions,
  isStrings,
  loadDevices,
}: typeof import("./browser") = require("./browser.ts");

const browserBridge = {
  id: "001788fffe123abc",
  address: "192.168.1.2",
  name: "Home bridge",
  applicationKey: "0123456789abcdef",
};
const browserRow = {
  id: "device-1",
  bridgeId: browserBridge.id,
  bridgeName: "ignored",
  name: "Desk lamp",
  product: "Hue lamp",
  model: "LCT001",
  type: "pendant_round",
  room: "Office",
  roomId: "room-1",
  zones: ["Work"],
  zoneIds: ["zone-1"],
  services: ["light"],
  manufacturer: "Signify",
  software: "1.0.0",
  hardware: "100b",
  mac: "00:17:88:01:0b:12:34:56",
  light: null,
};

function withBrowserFetch(
  response: unknown,
  run: (calls: RequestInit[]) => Promise<void>,
) {
  const originalFetch = globalThis.fetch;
  const calls: RequestInit[] = [];
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    calls.push(init ?? {});
    return new Response(JSON.stringify(response), { status: 200 });
  }) as typeof fetch;
  return run(calls).finally(() => {
    globalThis.fetch = originalFetch;
  });
}

testBrowser("validates device rows and option arrays", () => {
  browserAssert.equal(isStrings(["a", "b"]), true);
  browserAssert.equal(isStrings(["a", 1]), false);
  browserAssert.equal(isGroupOptions([{ id: "room-1", name: "Office" }]), true);
  browserAssert.equal(isGroupOptions([{ id: "room-1" }]), false);
  browserAssert.equal(isDeviceRow(browserRow, browserBridge.id), true);
  for (const field of [
    "id",
    "name",
    "product",
    "model",
    "type",
    "room",
    "manufacturer",
    "software",
    "hardware",
    "mac",
  ]) {
    const missing = { ...browserRow };
    Reflect.deleteProperty(missing, field);
    browserAssert.equal(isDeviceRow(missing, browserBridge.id), false);
    browserAssert.equal(
      isDeviceRow({ ...browserRow, [field]: 1 }, browserBridge.id),
      false,
    );
  }
  browserAssert.equal(
    isDeviceRow({ ...browserRow, bridgeId: "other" }, browserBridge.id),
    false,
  );
  browserAssert.equal(
    isDeviceRow({ ...browserRow, name: 1 }, browserBridge.id),
    false,
  );
  browserAssert.equal(
    isDeviceRow(
      { ...browserRow, light: { id: "light-1", on: true, color: false } },
      browserBridge.id,
    ),
    true,
  );
  browserAssert.equal(
    isDeviceRow({ ...browserRow, light: { id: "light-1" } }, browserBridge.id),
    false,
  );
});

testBrowser(
  "loads devices, labels their bridge, and rejects bad envelopes",
  async () => {
    await withBrowserFetch(
      {
        devices: [browserRow],
        rooms: [{ id: "room-1", name: "Office" }],
        zones: [],
      },
      async () => {
        const loaded = await loadDevices(browserBridge);
        browserAssert.equal(loaded.devices[0].bridgeName, "Home bridge");
      },
    );
    await withBrowserFetch(
      { devices: [browserRow], rooms: {}, zones: [] },
      async () => {
        await browserAssert.rejects(
          () => loadDevices(browserBridge),
          /device response was invalid/i,
        );
      },
    );
  },
);

testBrowser("posts edit requests to the bridge API", async () => {
  await withBrowserFetch({ ok: true }, async (calls) => {
    await editDevice(browserBridge, { deviceId: "device-1", roomId: null });
    browserAssert.equal(calls[0].method, "POST");
    browserAssert.deepEqual(JSON.parse(calls[0].body as string).edit, {
      deviceId: "device-1",
      roomId: null,
    });
  });
});
