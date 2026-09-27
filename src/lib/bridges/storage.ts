import type { Bridge, PairedBridge } from "./types";

const STORAGE_KEY = "hue-browser-bridges";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isBridge(value: unknown): value is Bridge {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    /^[a-f0-9]{16}$/i.test(value.id) &&
    typeof value.address === "string" &&
    (value.name === null || typeof value.name === "string")
  );
}

export function isPairedBridge(value: unknown): value is PairedBridge {
  return (
    isBridge(value) &&
    "applicationKey" in value &&
    typeof value.applicationKey === "string" &&
    /^[a-zA-Z0-9-]{16,128}$/.test(value.applicationKey)
  );
}

export function loadBridges(): PairedBridge[] {
  const text = localStorage.getItem(STORAGE_KEY);
  if (text === null) return [];
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error(
      "Saved bridge data is invalid. Clear saved bridges to pair again.",
    );
  }
  if (!Array.isArray(value) || !value.every(isPairedBridge)) {
    throw new Error(
      "Saved bridge data is invalid. Clear this site's storage to pair again.",
    );
  }
  return value;
}

export function saveBridge(bridges: PairedBridge[], bridge: PairedBridge) {
  const updated = [...bridges.filter((item) => item.id !== bridge.id), bridge];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function forgetBridge(bridges: PairedBridge[], id: string) {
  const updated = bridges.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearBridges() {
  localStorage.removeItem(STORAGE_KEY);
}
