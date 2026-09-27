import type {
  MigrationDevice,
  MigrationRequest,
  MigrationResult,
} from "../devices/migrations.ts";
import { isRecord } from "./storage";
import type { PairedBridge } from "./types";

function isDevice(
  value: unknown,
): value is MigrationDevice & Record<string, unknown> {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string"
  );
}

function isResult(value: unknown): value is MigrationResult {
  if (!isDevice(value)) return false;
  return (
    (value.status === "moved" ||
      value.status === "failed" ||
      value.status === "skipped") &&
    (value.error === undefined || typeof value.error === "string")
  );
}

async function callMigration(
  bridge: PairedBridge,
  body: Record<string, unknown>,
) {
  const response = await fetch("/api/bridges/migrate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      address: bridge.address,
      id: bridge.id,
      applicationKey: bridge.applicationKey,
      ...body,
    }),
    cache: "no-store",
  });
  const value: unknown = await response.json();
  if (!response.ok) {
    if (isRecord(value) && typeof value.error === "string")
      throw new Error(value.error);
    throw new Error("The bridge migration failed. Try again.");
  }
  return value;
}

export async function previewMigration(
  bridge: PairedBridge,
  migration: MigrationRequest,
) {
  const value = await callMigration(bridge, { migration, preview: true });
  if (
    !isRecord(value) ||
    !Array.isArray(value.devices) ||
    !value.devices.every(isDevice)
  ) {
    throw new Error("The migration preview response was invalid.");
  }
  return value.devices;
}

export async function applyBridgeMigration(
  bridge: PairedBridge,
  migration: MigrationRequest,
) {
  const value = await callMigration(bridge, { migration });
  if (
    !isRecord(value) ||
    !Array.isArray(value.results) ||
    !value.results.every(isResult)
  ) {
    throw new Error("The migration result response was invalid.");
  }
  return value.results;
}
