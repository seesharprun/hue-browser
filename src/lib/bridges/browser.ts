import type { DeviceRow } from "../devices/types";
import type { Bridge, BridgeCandidate, PairedBridge } from "./types";

const STORAGE_KEY = "hue-browser-bridges";

function isRecord(value: unknown): value is Record<string, unknown> {
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

async function callApi(path: string, body?: unknown): Promise<unknown> {
  const response = await fetch(`/api/bridges/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers:
      body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const value: unknown = await response.json();
  if (!response.ok) {
    if (isRecord(value) && typeof value.error === "string") {
      throw new Error(value.error);
    }
    throw new Error("The bridge request failed. Try again.");
  }
  return value;
}

export async function discoverBridges(): Promise<BridgeCandidate[]> {
  const value = await callApi("discover");
  if (
    !Array.isArray(value) ||
    !value.every(
      (item: unknown) =>
        isRecord(item) &&
        typeof item.id === "string" &&
        /^[a-f0-9]{16}$/i.test(item.id) &&
        typeof item.address === "string",
    )
  ) {
    throw new Error("The discovery response was invalid.");
  }
  return value;
}

export async function identifyBridge(address: string): Promise<Bridge> {
  const value = await callApi("identify", { address });
  if (!isBridge(value))
    throw new Error("The bridge identity response was invalid.");
  return value;
}

export async function pairBridge(bridge: Bridge): Promise<PairedBridge> {
  const value = await callApi("pair", {
    address: bridge.address,
    id: bridge.id,
  });
  if (!isPairedBridge(value))
    throw new Error("The bridge pairing response was invalid.");
  return value;
}

export async function loadDevices(bridge: PairedBridge): Promise<DeviceRow[]> {
  const value = await callApi("devices", {
    address: bridge.address,
    id: bridge.id,
    applicationKey: bridge.applicationKey,
  });
  if (
    !Array.isArray(value) ||
    !value.every(
      (row: unknown) =>
        isRecord(row) &&
        typeof row.id === "string" &&
        row.bridgeId === bridge.id &&
        typeof row.name === "string" &&
        typeof row.product === "string" &&
        typeof row.model === "string" &&
        typeof row.type === "string" &&
        typeof row.room === "string" &&
        typeof row.manufacturer === "string" &&
        typeof row.software === "string" &&
        typeof row.hardware === "string" &&
        typeof row.mac === "string" &&
        Array.isArray(row.zones) &&
        row.zones.every((zone: unknown) => typeof zone === "string") &&
        Array.isArray(row.services) &&
        row.services.every((service: unknown) => typeof service === "string"),
    )
  ) {
    throw new Error("The device response was invalid.");
  }
  return value.map((row: DeviceRow) => ({
    ...row,
    bridgeName: bridge.name ?? bridge.address,
  }));
}
