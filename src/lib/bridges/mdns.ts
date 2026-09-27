import { createSocket, type Socket } from "node:dgram";
import { mergeBridgeCandidates } from "./discovery-result";
import { parseMdnsResponse } from "./mdns-parser";
import { mdnsQuery } from "./mdns-query";
import type { BridgeCandidate } from "./types";

const MDNS_ADDRESS = "224.0.0.251";
const MDNS_PORT = 5353;
const MDNS_TIMEOUT_MS = 2_500;
const RESPONSE_GRACE_MS = 300;

export function discoverMdnsBridges(
  timeoutMs = MDNS_TIMEOUT_MS,
): Promise<BridgeCandidate[]> {
  return new Promise((resolve, reject) => {
    const socket = createSocket({ type: "udp4", reuseAddr: true });
    const found: BridgeCandidate[][] = [];
    let settled = false;
    let quickTimer: ReturnType<typeof setTimeout> | undefined;
    const timer = setTimeout(() => complete(resolveFound), timeoutMs);
    const complete = (done: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (quickTimer) clearTimeout(quickTimer);
      finish(socket, done);
    };
    const resolveFound = () => resolve(mergeBridgeCandidates(found));
    socket.on("message", (message) => {
      const candidates = parseMdnsResponse(message);
      if (candidates.length === 0) return;
      found.push(candidates);
      if (quickTimer) clearTimeout(quickTimer);
      quickTimer = setTimeout(() => complete(resolveFound), RESPONSE_GRACE_MS);
    });
    socket.on("error", (error) => {
      complete(() => reject(error));
    });
    socket.bind(MDNS_PORT, () => {
      try {
        socket.addMembership(MDNS_ADDRESS);
      } catch (error) {
        complete(() => reject(error));
        return;
      }
      const query = mdnsQuery();
      socket.send(query, 0, query.length, MDNS_PORT, MDNS_ADDRESS, (error) => {
        if (!error) return;
        complete(() => reject(error));
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
