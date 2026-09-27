import { isIP } from "node:net";

export type Bridge = {
  id: string;
  address: string;
  name: string | null;
  /** Philips model id, missing for bridges paired before it was recorded. */
  model?: string | null;
};

export type PairedBridge = Bridge & { applicationKey: string };

export type BridgeCandidate = {
  id: string;
  address: string;
};

export type DiscoveredBridge = BridgeCandidate & {
  name: string | null;
  error: string | null;
  status: "loading" | "ready" | "error";
};

export class BridgeError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function isLocalAddress(value: unknown): value is string {
  if (typeof value !== "string" || isIP(value) !== 4) return false;
  const [a, b] = value.split(".").map(Number);
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

export function isBridgeId(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{16}$/i.test(value);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function bridgeCandidates(value: unknown): BridgeCandidate[] {
  if (!Array.isArray(value) || value.length > 16) {
    throw new BridgeError(
      "The Philips Hue discovery service returned invalid data.",
      502,
    );
  }
  const seen = new Set<string>();
  return value.map((entry: unknown) => {
    if (
      !isRecord(entry) ||
      !isBridgeId(entry.id) ||
      !isLocalAddress(entry.internalipaddress)
    ) {
      throw new BridgeError(
        "The Philips Hue discovery service returned invalid data.",
        502,
      );
    }
    const id = entry.id.toLowerCase();
    if (seen.has(id)) {
      throw new BridgeError(
        "The Philips Hue discovery service returned duplicate bridges.",
        502,
      );
    }
    seen.add(id);
    return { id, address: entry.internalipaddress };
  });
}

export function bridgeFromConfig(value: unknown, address: string): Bridge {
  if (!isRecord(value) || !isBridgeId(value.bridgeid)) {
    throw new BridgeError(
      "The bridge returned invalid identity information.",
      502,
    );
  }
  return {
    id: value.bridgeid.toLowerCase(),
    address,
    name:
      typeof value.name === "string" && value.name.trim()
        ? value.name.trim().slice(0, 80)
        : null,
    model:
      typeof value.modelid === "string" && value.modelid.trim()
        ? value.modelid.trim().slice(0, 16)
        : null,
  };
}

export function applicationKeyFromResponse(value: unknown): string {
  if (!Array.isArray(value) || value.length !== 1 || !isRecord(value[0])) {
    throw new BridgeError(
      "The bridge returned an invalid pairing response.",
      502,
    );
  }
  const result = value[0];
  if (isRecord(result.error)) {
    if (result.error.type === 101) {
      throw new BridgeError(
        "Press the bridge button, then try pairing again.",
        409,
      );
    }
    throw new BridgeError("The bridge rejected the pairing request.", 502);
  }
  if (
    !isRecord(result.success) ||
    typeof result.success.username !== "string" ||
    !/^[a-zA-Z0-9-]{16,128}$/.test(result.success.username)
  ) {
    throw new BridgeError("The bridge did not return an application key.", 502);
  }
  return result.success.username;
}
