import type { GroupCreateRequest } from "../devices/group-create";
import { callApi } from "./browser";
import type { PairedBridge } from "./types";

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
