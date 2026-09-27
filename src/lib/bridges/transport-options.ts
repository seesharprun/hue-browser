import { Agent } from "node:https";
import { checkServerIdentity } from "node:tls";
import { HUE_BRIDGE_CA } from "./hue-ca.ts";

// Resumed TLS sessions can omit the peer certificate needed to check bridge ID.
export const bridgeAgent = new Agent({ maxCachedSessions: 0 });

export function bridgeRequestOptions(
  address: string,
  path: string,
  method: "GET" | "POST" | "PUT",
  expectedId?: string,
  body?: string,
  applicationKey?: string,
) {
  const headers = {
    ...(body
      ? {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
        }
      : {}),
    ...(applicationKey ? { "hue-application-key": applicationKey } : {}),
  };
  return {
    hostname: address,
    port: 443,
    agent: bridgeAgent,
    path,
    method,
    ca: HUE_BRIDGE_CA,
    rejectUnauthorized: true,
    checkServerIdentity: (
      _: string,
      certificate: Parameters<typeof checkServerIdentity>[1],
    ) =>
      expectedId ? checkServerIdentity(expectedId, certificate) : undefined,
    headers,
  };
}
