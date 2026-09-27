import { discoveryError } from "./discovery-error";
import { type BridgeCandidate, BridgeError, bridgeCandidates } from "./types";

export async function discoverBridges(): Promise<BridgeCandidate[]> {
  let response: Response;
  try {
    response = await fetch("https://discovery.meethue.com/", {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(5_000),
    });
  } catch (error) {
    console.error("Philips Hue bridge discovery failed:", error);
    throw new BridgeError(
      "The Philips Hue discovery service is unavailable. Enter a bridge address instead.",
      502,
    );
  }
  if (!response.ok) {
    throw new BridgeError(
      discoveryError(response),
      response.status === 429 ? 429 : 502,
    );
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    console.error("Invalid Philips Hue discovery response:", error);
    throw new BridgeError(
      "The Philips Hue discovery service returned invalid data.",
      502,
    );
  }
  return bridgeCandidates(data);
}
