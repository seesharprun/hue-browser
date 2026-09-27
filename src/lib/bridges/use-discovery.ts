"use client";

import { useEffect, useRef, useState } from "react";
import { discoverBridges, identifyBridge } from "./browser";
import type { BridgeCandidate, DiscoveredBridge } from "./types";

async function resolveName(
  candidate: BridgeCandidate,
): Promise<DiscoveredBridge> {
  try {
    const bridge = await identifyBridge(candidate.address);
    if (bridge.id !== candidate.id) {
      throw new Error(
        "The bridge at this IP has a different ID. Try entering its IP manually.",
      );
    }
    return { ...candidate, name: bridge.name, error: null, status: "ready" };
  } catch (cause) {
    const error =
      cause instanceof Error
        ? cause.message
        : "Could not verify this bridge locally.";
    return { ...candidate, name: null, error, status: "error" };
  }
}

export function useDiscovery() {
  const [found, setFound] = useState<DiscoveredBridge[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const generation = useRef(0);

  useEffect(
    () => () => {
      generation.current += 1;
    },
    [],
  );

  async function search() {
    const current = ++generation.current;
    setFound(null);
    setError("");
    setSearching(true);
    try {
      const candidates = await discoverBridges();
      if (current !== generation.current) return;
      setFound(
        candidates.map((candidate) => ({
          ...candidate,
          name: null,
          error: null,
          status: "loading",
        })),
      );
      await Promise.all(
        candidates.map(async (candidate) => {
          const resolved = await resolveName(candidate);
          if (current === generation.current) {
            setFound(
              (previous) =>
                previous?.map((item) =>
                  item.id === candidate.id ? resolved : item,
                ) ?? null,
            );
          }
        }),
      );
    } catch (cause) {
      if (current === generation.current) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Discovery failed. Enter an IP address.",
        );
      }
    } finally {
      if (current === generation.current) setSearching(false);
    }
  }

  function clear() {
    generation.current += 1;
    setFound(null);
    setError("");
    setSearching(false);
  }

  return {
    found,
    searching,
    error,
    search,
    clear,
    clearError: () => setError(""),
  };
}
