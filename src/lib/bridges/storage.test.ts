const { test: testStorage }: typeof import("node:test") = require("node:test");
const storageAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  clearBridges: storageClearBridges,
  forgetBridge: storageForgetBridge,
  isBridge,
  isPairedBridge,
  loadBridges: storageLoadBridges,
  replaceBridges: storageReplaceBridges,
  saveBridge: storageSaveBridge,
}: typeof import("./storage") = require("./storage.ts");

const storageKey = "hue-browser-bridges";
const storageBridge = {
  id: "001788fffe123abc",
  address: "192.168.1.2",
  name: "Kitchen bridge",
  model: "BSB004",
  applicationKey: "0123456789abcdef",
};

function withStorageStorage(run: (entries: Map<string, string>) => void) {
  const entries = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
      removeItem: (key: string) => entries.delete(key),
    },
  });
  try {
    run(entries);
  } finally {
    Reflect.deleteProperty(globalThis, "localStorage");
  }
}

testStorage("validates bridge and paired bridge shapes", () => {
  storageAssert.equal(isBridge(storageBridge), true);
  storageAssert.equal(isPairedBridge(storageBridge), true);
  storageAssert.equal(isBridge({ ...storageBridge, id: "bad" }), false);
  storageAssert.equal(isPairedBridge({ ...storageBridge }), true);
  storageAssert.equal(
    isPairedBridge({ ...storageBridge, applicationKey: "short" }),
    false,
  );
});

testStorage("round-trips, replaces, forgets, and clears bridges", () => {
  withStorageStorage(() => {
    const saved = storageSaveBridge([], storageBridge);
    storageAssert.deepEqual(storageLoadBridges(), saved);
    const replaced = storageSaveBridge(saved, {
      ...storageBridge,
      address: "192.168.1.3",
    });
    storageAssert.equal(replaced.length, 1);
    storageAssert.equal(replaced[0].address, "192.168.1.3");
    storageAssert.deepEqual(storageReplaceBridges([storageBridge]), [
      storageBridge,
    ]);
    storageAssert.deepEqual(
      storageForgetBridge([storageBridge], storageBridge.id),
      [],
    );
    storageClearBridges();
    storageAssert.deepEqual(storageLoadBridges(), []);
  });
});

testStorage("rejects malformed entries but tolerates corrupt JSON", () => {
  withStorageStorage((entries) => {
    entries.set(
      storageKey,
      JSON.stringify([{ ...storageBridge, address: 42 }]),
    );
    storageAssert.throws(
      () => storageLoadBridges(),
      /Saved bridge data is invalid/,
    );
    entries.set(storageKey, "{broken");
    storageAssert.deepEqual(storageLoadBridges(), []);
  });
});
