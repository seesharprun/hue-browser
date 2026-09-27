import { discoveryError } from "./discovery-error";
import { discoveryIssue, mergeBridgeCandidates } from "./discovery-result";
import { discoverMdnsBridges } from "./mdns";
import {
  type BridgeCandidate,
  BridgeError,
  bridgeCandidates,
  type DiscoveryIssue,
  type DiscoveryResult,
} from "./types";

export async function discoverBridges(): Promise<DiscoveryResult> {
  const [online, local] = await Promise.allSettled([
    discoverOnlineBridges(),
    discoverMdnsBridges(),
  ]);
  const groups: BridgeCandidate[][] = [];
  const errors: DiscoveryIssue[] = [];
  if (online.status === "fulfilled") groups.push(online.value);
  else errors.push(discoveryIssue("online", online.reason));
  if (local.status === "fulfilled") groups.push(local.value);
  else errors.push(discoveryIssue("local mDNS", local.reason));
  return { bridges: mergeBridgeCandidates(groups), errors };
}

async function discoverOnlineBridges(): Promise<BridgeCandidate[]> {
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
