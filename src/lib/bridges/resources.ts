import { bridgeRequest, identifyBridge } from "./transport.ts";
import { BridgeError, isRecord } from "./types.ts";

function commandFailure(value: unknown): string | null {
  if (!isRecord(value) || !Array.isArray(value.errors)) return null;
  if (!value.errors.length) return null;
  const described = value.errors
    .map((item) =>
      isRecord(item) && typeof item.description === "string"
        ? item.description
        : "",
    )
    .filter(Boolean);
  return described.length
    ? `The bridge refused the command: ${described.join(" ")}`
    : "The bridge refused the command.";
}

export async function sendBridgeCommand(
  address: string,
  expectedId: string,
  applicationKey: string,
  path: string,
  body: unknown,
): Promise<void> {
  const bridge = await identifyBridge(address);
  if (bridge.id !== expectedId.toLowerCase()) {
    throw new BridgeError(
      "This address now belongs to a different bridge.",
      409,
    );
  }
  try {
    const { value } = await bridgeRequest(
      address,
      path,
      "PUT",
      bridge.id,
      JSON.stringify(body),
      applicationKey,
    );
    // The bridge answers 200 even when it refuses a command, so the reason
    // only appears in the response body.
    const failure = commandFailure(value);
    if (failure) throw new BridgeError(failure, 502);
  } catch (error) {
    if (error instanceof BridgeError) throw error;
    console.error("Philips Hue command request failed:", error);
    throw new BridgeError(
      "The bridge could not run that command. Check the device and try again.",
      502,
    );
  }
}

export async function getBridgeResources(
  address: string,
  expectedId: string,
  applicationKey: string,
): Promise<unknown> {
  const bridge = await identifyBridge(address);
  if (bridge.id !== expectedId.toLowerCase()) {
    throw new BridgeError(
      "This address now belongs to a different bridge.",
      409,
    );
  }
  try {
    const { value } = await bridgeRequest(
      address,
      "/clip/v2/resource",
      "GET",
      bridge.id,
      undefined,
      applicationKey,
      8_000_000,
    );
    return value;
  } catch (error) {
    if (error instanceof BridgeError) throw error;
    console.error("Philips Hue resource request failed:", error);
    throw new BridgeError(
      "Could not load devices from this bridge. Check its connection and pair again if necessary.",
      502,
    );
  }
}
