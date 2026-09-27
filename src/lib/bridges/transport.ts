import { Agent, request } from "node:https";
import { checkServerIdentity, type TLSSocket } from "node:tls";
import { HUE_BRIDGE_CA } from "./hue-ca";
import {
  applicationKeyFromResponse,
  type Bridge,
  BridgeError,
  bridgeFromConfig,
} from "./types";

const TIMEOUT_MS = 5_000;
const MAX_BYTES = 32_768;
// Resumed TLS sessions can omit the peer certificate needed to check bridge ID.
const bridgeAgent = new Agent({ maxCachedSessions: 0 });

export function bridgeRequest(
  address: string,
  path: string,
  method: "GET" | "POST",
  expectedId?: string,
  body?: string,
  applicationKey?: string,
  maxBytes = MAX_BYTES,
): Promise<{ value: unknown; certificateId: string | undefined }> {
  return new Promise((resolve, reject) => {
    const req = request(
      {
        hostname: address,
        port: 443,
        agent: bridgeAgent,
        path,
        method,
        ca: HUE_BRIDGE_CA,
        rejectUnauthorized: true,
        checkServerIdentity: (_, certificate) =>
          expectedId ? checkServerIdentity(expectedId, certificate) : undefined,
        headers: {
          ...(body
            ? {
                "content-type": "application/json",
                "content-length": Buffer.byteLength(body),
              }
            : {}),
          ...(applicationKey ? { "hue-application-key": applicationKey } : {}),
        },
      },
      (res) => {
        const socket = res.socket as TLSSocket;
        const peerCertificate = socket.getPeerCertificate();
        const commonName = peerCertificate.subject?.CN;
        const certificateId =
          typeof commonName === "string" ? commonName.toLowerCase() : undefined;
        if (res.statusCode !== 200) {
          res.resume();
          reject(
            new BridgeError(
              res.statusCode === 401 || res.statusCode === 403
                ? "The bridge rejected this application key. Pair it again."
                : "The bridge could not complete the request.",
              res.statusCode === 401 || res.statusCode === 403 ? 403 : 502,
            ),
          );
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        res.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > maxBytes) {
            res.destroy(
              new BridgeError("The bridge response was too large.", 502),
            );
            return;
          }
          chunks.push(chunk);
        });
        res.on("error", reject);
        res.on("end", () => {
          try {
            resolve({
              value: JSON.parse(Buffer.concat(chunks).toString("utf8")),
              certificateId,
            });
          } catch {
            reject(new BridgeError("The bridge returned invalid JSON.", 502));
          }
        });
      },
    );
    req.setTimeout(TIMEOUT_MS, () =>
      req.destroy(new Error("Bridge request timed out")),
    );
    req.on("error", reject);
    req.end(body);
  });
}

export async function identifyBridge(address: string): Promise<Bridge> {
  try {
    // Only the public identity request omits hostname matching; CA validation
    // still applies, and the returned ID must match the signed certificate.
    const { value, certificateId } = await bridgeRequest(
      address,
      "/api/unauthenticated/config",
      "GET",
    );
    const bridge = bridgeFromConfig(value, address);
    if (certificateId !== bridge.id) {
      throw new BridgeError(
        "The bridge identity does not match its certificate.",
        502,
      );
    }
    return bridge;
  } catch (error) {
    if (error instanceof BridgeError) throw error;
    console.error("Philips Hue bridge identification failed:", error);
    throw new BridgeError(
      "Could not connect securely to this bridge. Check its address, firmware, and network.",
      502,
    );
  }
}

export async function pairBridge(address: string, expectedId: string) {
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
      "/api",
      "POST",
      bridge.id,
      JSON.stringify({ devicetype: "hue-browser" }),
    );
    return { ...bridge, applicationKey: applicationKeyFromResponse(value) };
  } catch (error) {
    if (error instanceof BridgeError) throw error;
    console.error("Philips Hue bridge pairing failed:", error);
    throw new BridgeError(
      "Could not reach the bridge to pair. Try again.",
      502,
    );
  }
}
