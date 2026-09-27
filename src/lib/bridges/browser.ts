import type { DeviceCommand } from "../devices/commands";
import type { EditRequest } from "../devices/edits";
import type { BridgeDevices, DeviceRow, GroupOption } from "../devices/types";
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

export async function editDevice(
  bridge: PairedBridge,
  edit: EditRequest,
): Promise<void> {
  await callApi("edit", {
    address: bridge.address,
    id: bridge.id,
    applicationKey: bridge.applicationKey,
    edit,
  });
}

const STRING_FIELDS =
  "id name product model type room manufacturer software hardware mac".split(
    " ",
  );

function isDeviceRow(row: unknown, bridgeId: string) {
  return (
    isRecord(row) &&
    row.bridgeId === bridgeId &&
    STRING_FIELDS.every((field) => typeof row[field] === "string") &&
    (row.roomId === null || typeof row.roomId === "string") &&
    isStrings(row.zones) &&
    isStrings(row.zoneIds) &&
    isStrings(row.services) &&
    (row.light === null ||
      (isRecord(row.light) &&
        typeof row.light.id === "string" &&
        typeof row.light.on === "boolean" &&
        typeof row.light.color === "boolean"))
  );
}

function isStrings(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isGroupOptions(value: unknown): value is GroupOption[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item: unknown) =>
        isRecord(item) &&
        typeof item.id === "string" &&
        typeof item.name === "string",
    )
  );
}

export async function loadDevices(
  bridge: PairedBridge,
): Promise<BridgeDevices> {
  const value = await callApi("devices", {
    address: bridge.address,
    id: bridge.id,
    applicationKey: bridge.applicationKey,
  });
  if (
    !isRecord(value) ||
    !Array.isArray(value.devices) ||
    !value.devices.every((row: unknown) => isDeviceRow(row, bridge.id)) ||
    !isGroupOptions(value.rooms) ||
    !isGroupOptions(value.zones)
  ) {
    throw new Error("The device response was invalid.");
  }
  return {
    devices: (value.devices as DeviceRow[]).map((row) => ({
      ...row,
      bridgeName: bridge.name ?? bridge.address,
    })),
    rooms: value.rooms,
    zones: value.zones,
  };
}
