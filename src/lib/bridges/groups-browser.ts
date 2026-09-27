import type { GroupCreateRequest } from "../devices/group-create";
import type { PairedBridge } from "./types";
import { callApi } from "./browser";

export async function createBridgeGroup(
  bridge: PairedBridge,
  group: GroupCreateRequest,
): Promise<void> {
  await callApi("groups", {
    address: bridge.address,
    id: bridge.id,
    applicationKey: bridge.applicationKey,
    group,
  });
}
