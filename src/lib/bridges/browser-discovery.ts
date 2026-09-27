import { isRecord } from "./storage.ts";
import type { DiscoveryResult } from "./types.ts";

export function isDiscoveryResult(value: unknown): value is DiscoveryResult {
  return (
    isRecord(value) &&
    Array.isArray(value.bridges) &&
    value.bridges.every(isBridgeCandidate) &&
    Array.isArray(value.errors) &&
    value.errors.every(
      (item) =>
        isRecord(item) &&
        (item.method === "online" || item.method === "local mDNS") &&
        typeof item.message === "string",
    )
  );
}

function isBridgeCandidate(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    /^[a-f0-9]{16}$/i.test(value.id) &&
    typeof value.address === "string"
  );
}
