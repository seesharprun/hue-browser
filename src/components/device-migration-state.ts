import { useMemo, useState } from "react";
import type { PairedBridge } from "../lib/bridges/types";
import type { GroupKind } from "../lib/devices/migrations";
import type { BridgeGroups } from "../lib/devices/use-devices";
import { emptyValue } from "./device-migration-parts";

export function useMigrationState(
  bridges: PairedBridge[],
  groups: BridgeGroups,
  reset: () => void,
) {
  const [bridgeId, setBridgeId] = useState("");
  const [groupType, setGroupType] = useState<GroupKind>("room");
  const [sourceId, setSourceId] = useState("");
  const [destination, setDestination] = useState(emptyValue);
  const selectedBridgeId = bridgeId || bridges[0]?.id || "";
  const bridge = bridges.find((item) => item.id === selectedBridgeId);
  const catalog = groups[selectedBridgeId] ?? { rooms: [], zones: [] };
  const options = groupType === "room" ? catalog.rooms : catalog.zones;
  const sourceIdOrFirst = sourceId || options[0]?.id || "";
  const destinationOptions = options.filter(
    (item) => item.id !== sourceIdOrFirst,
  );
  const migration = useMemo(
    () => ({
      groupType,
      sourceId: sourceIdOrFirst,
      destinationId: destination === emptyValue ? null : destination,
    }),
    [groupType, sourceIdOrFirst, destination],
  );
  return {
    bridge,
    groupType,
    selectedBridgeId,
    sourceId: sourceIdOrFirst,
    sourceOptions: options,
    destination,
    destinationOptions,
    migration,
    setBridge: (value: string) => {
      reset();
      setBridgeId(value);
      setSourceId("");
      setDestination(emptyValue);
    },
    setGroupType: (value: GroupKind) => {
      reset();
      setGroupType(value);
      setSourceId("");
      setDestination(emptyValue);
    },
    setSource: (value: string) => {
      reset();
      setSourceId(value);
    },
    setDestination: (value: string) => {
      reset();
      setDestination(value);
    },
  };
}
