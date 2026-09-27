import { bridgeRequest, identifyBridge } from "./transport";
import { BridgeError } from "./types";

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
