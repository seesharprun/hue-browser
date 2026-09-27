"use client";

import { useCallback, useState } from "react";
import { createBridgeGroup } from "../bridges/groups-browser";
import type { PairedBridge } from "../bridges/types";
import { useToasts } from "../ui/toasts";
import {
  promptBridge,
  promptRoomCreate,
  promptZoneCreate,
} from "./group-prompts";

export function useGroupCreate(bridges: PairedBridge[], refresh: () => void) {
  const [creating, setCreating] = useState(false);
  const { notify } = useToasts();

  const create = useCallback(
    async (type: "room" | "zone") => {
      const bridge = promptBridge(bridges);
      if (!bridge) return;
      const room = type === "room" ? promptRoomCreate() : null;
      const zone = type === "zone" ? promptZoneCreate() : null;
      const group = room ?? zone;
      if (!group) return;
      setCreating(true);
      try {
        if (room) {
          await createBridgeGroup(bridge, { type: "room", ...room });
        } else {
          if (!zone) return;
          await createBridgeGroup(bridge, { type: "zone", ...zone });
        }
        notify({
          tone: "success",
          key: `create-${type}`,
          message: `Created ${group.name}.`,
        });
        refresh();
      } catch (cause) {
        notify({
          tone: "error",
          key: `create-${type}`,
          message:
            cause instanceof Error
              ? `${group.name}: ${cause.message}`
              : `Could not create ${group.name}.`,
        });
      } finally {
        setCreating(false);
      }
    },
    [bridges, notify, refresh],
  );

  return {
    creating,
    createRoom: () => create("room"),
    createZone: () => create("zone"),
  };
}
