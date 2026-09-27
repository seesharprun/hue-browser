import { createSocket, type Socket } from "node:dgram";
import { mergeBridgeCandidates } from "./discovery-result.ts";
import { parseMdnsResponse } from "./mdns-parser.ts";
import type { BridgeCandidate } from "./types.ts";

const MDNS_ADDRESS = "224.0.0.251";
const MDNS_PORT = 5353;
const MDNS_TIMEOUT_MS = 2_500;

export function discoverMdnsBridges(
  timeoutMs = MDNS_TIMEOUT_MS,
): Promise<BridgeCandidate[]> {
  return new Promise((resolve, reject) => {
    const socket = createSocket({ type: "udp4", reuseAddr: true });
    const found: BridgeCandidate[][] = [];
    const timer = setTimeout(
      () => finish(socket, () => resolve(mergeBridgeCandidates(found))),
      timeoutMs,
    );
    socket.on("message", (message) => found.push(parseMdnsResponse(message)));
    socket.on("error", (error) => {
      clearTimeout(timer);
      finish(socket, () => reject(error));
    });
    socket.bind(MDNS_PORT, () => {
      try {
        socket.addMembership(MDNS_ADDRESS);
      } catch (error) {
        clearTimeout(timer);
        finish(socket, () => reject(error));
        return;
      }
      const query = mdnsQuery();
      socket.send(query, 0, query.length, MDNS_PORT, MDNS_ADDRESS, (error) => {
        if (!error) return;
        clearTimeout(timer);
        finish(socket, () => reject(error));
      });
    });
  });
}

function finish(socket: Socket, done: () => void) {
  try {
    socket.close(done);
  } catch {
    done();
  }
}

export function mdnsQuery(service = "_hue._tcp.local"): Buffer {
  const labels = service.split(".");
  const name = Buffer.concat([
    ...labels.map((label) =>
      Buffer.from([label.length, ...Buffer.from(label)]),
    ),
    Buffer.from([0]),
  ]);
  const header = Buffer.from([0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]);
  const question = Buffer.from([0, 12, 0, 1]);
  return Buffer.concat([header, name, question]);
}
