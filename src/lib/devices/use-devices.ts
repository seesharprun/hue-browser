"use client";

import { useCallback, useEffect, useState } from "react";
import { loadDevices } from "../bridges/browser";
import type { PairedBridge } from "../bridges/types";
import type { DeviceRow } from "./types";

export function useDevices(bridges: PairedBridge[]) {
  const [rows, setRows] = useState<DeviceRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((current) => current + 1), []);
  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh increments revision to explicitly reload the current bridges
  useEffect(() => {
    let current = true;
    if (!bridges.length) {
      setRows([]);
      setErrors({});
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrors({});
    Promise.all(
      bridges.map(async (bridge) => {
        try {
          return {
            bridgeId: bridge.id,
            rows: await loadDevices(bridge),
            error: "",
          };
        } catch (cause) {
          return {
            bridgeId: bridge.id,
            rows: [] as DeviceRow[],
            error:
              cause instanceof Error
                ? cause.message
                : "Could not load devices.",
          };
        }
      }),
    ).then((results) => {
      if (!current) return;
      setRows(results.flatMap((result) => result.rows));
      setErrors(
        Object.fromEntries(
          results
            .filter((result) => result.error)
            .map((result) => [result.bridgeId, result.error]),
        ),
      );
      setLoading(false);
    });
    return () => {
      current = false;
    };
  }, [bridges, revision]);

  return { rows, errors, loading, refresh };
}
