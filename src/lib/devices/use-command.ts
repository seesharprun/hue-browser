"use client";

import { useCallback, useState } from "react";
import { sendCommand } from "../bridges/browser";
import type { PairedBridge } from "../bridges/types";
import { useToasts } from "../ui/toasts";
import { type DeviceCommand, describe } from "./commands";
import type { DeviceRow } from "./types";

export function useDeviceCommand(bridges: PairedBridge[]) {
  const [pending, setPending] = useState("");
  const { notify } = useToasts();

  const run = useCallback(
    async (row: DeviceRow, command: DeviceCommand) => {
      const bridge = bridges.find((item) => item.id === row.bridgeId);
      // Identify addresses the device itself; power and color need its light.
      const resource =
        command.action === "identify" ? row.id : (row.light?.id ?? "");
      const key = `command:${row.bridgeId}:${row.id}`;
      if (!bridge || !resource) {
        notify({
          tone: "error",
          key,
          message: `${row.name} cannot run that command.`,
        });
        return;
      }
      setPending(row.id);
      try {
        await sendCommand(bridge, resource, command);
        notify({
          tone: "success",
          key,
          message: `${row.name} ${describe(command)}.`,
        });
      } catch (cause) {
        notify({
          tone: "error",
          key,
          message:
            cause instanceof Error
              ? `${row.name}: ${cause.message}`
              : `${row.name}: the command failed.`,
        });
      } finally {
        setPending("");
      }
    },
    [bridges, notify],
  );

  return { run, pending };
}
