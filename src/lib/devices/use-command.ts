"use client";

import { useCallback, useState } from "react";
import { sendCommand } from "../bridges/browser";
import type { PairedBridge } from "../bridges/types";
import type { DeviceCommand } from "./commands";
import type { DeviceRow } from "./types";

export function useDeviceCommand(bridges: PairedBridge[]) {
  const [pending, setPending] = useState("");
  const [failed, setFailed] = useState<Record<string, string>>({});

  const run = useCallback(
    async (row: DeviceRow, command: DeviceCommand) => {
      const bridge = bridges.find((item) => item.id === row.bridgeId);
      // Identify addresses the device itself; power and color need its light.
      const resource =
        command.action === "identify" ? row.id : (row.light?.id ?? "");
      if (!bridge || !resource) {
        setFailed((current) => ({
          ...current,
          [row.id]: "This device cannot run that command.",
        }));
        return;
      }
      setPending(row.id);
      setFailed((current) => {
        const { [row.id]: _removed, ...rest } = current;
        return rest;
      });
      try {
        await sendCommand(bridge, resource, command);
      } catch (cause) {
        setFailed((current) => ({
          ...current,
          [row.id]:
            cause instanceof Error ? cause.message : "The command failed.",
        }));
      } finally {
        setPending("");
      }
    },
    [bridges],
  );

  return { run, pending, failed };
}
