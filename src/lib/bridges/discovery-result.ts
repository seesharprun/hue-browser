import type {
  BridgeCandidate,
  DiscoveryIssue,
  DiscoveryResult,
} from "./types.ts";

export function mergeBridgeCandidates(
  groups: BridgeCandidate[][],
): BridgeCandidate[] {
  const merged = new Map<string, BridgeCandidate>();
  for (const candidates of groups) {
    for (const candidate of candidates) {
      if (!merged.has(candidate.id)) merged.set(candidate.id, candidate);
    }
  }
  return [...merged.values()];
}

export function discoveryIssue(
  method: DiscoveryIssue["method"],
  cause: unknown,
): DiscoveryIssue {
  return {
    method,
    message:
      cause instanceof Error
        ? cause.message
        : `${method} discovery failed. Enter a bridge IP address instead.`,
  };
}

export function discoveryErrorMessage(result: DiscoveryResult): string {
  return result.errors
    .map((error) => `${error.method}: ${error.message}`)
    .join(" ");
}
