import type { DeviceCommand } from "../devices/commands";
import type { DeviceRow } from "../devices/types";
import { isBridge, isPairedBridge, isRecord } from "./storage";
import type { Bridge, BridgeCandidate, PairedBridge } from "./types";

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

export async function sendCommand(
  bridge: PairedBridge,
  resource: string,
  command: DeviceCommand,
): Promise<void> {
  await callApi("command", {
    address: bridge.address,
    id: bridge.id,
    applicationKey: bridge.applicationKey,
    resource,
    command,
  });
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
        row.services.every((service: unknown) => typeof service === "string") &&
        (row.light === null ||
          (isRecord(row.light) &&
            typeof row.light.id === "string" &&
            typeof row.light.on === "boolean" &&
            typeof row.light.color === "boolean")),
    )
  ) {
    throw new Error("The device response was invalid.");
  }
  return value.map((row: DeviceRow) => ({
    ...row,
    bridgeName: bridge.name ?? bridge.address,
  }));
}
