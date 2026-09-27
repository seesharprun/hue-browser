import { sendBridgeCommand } from "../../../../lib/bridges/resources";
import {
  bridgeFailure,
  bridgeInput,
  bridgeResponse,
} from "../../../../lib/bridges/route-error";
import { BridgeError, isRecord } from "../../../../lib/bridges/types";
import {
  createGroupUpdate,
  isCreateGroupRequest,
} from "../../../../lib/devices/group-create";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.clone().json();
    const { address, id, applicationKey } = await bridgeInput(request, true);
    if (
      typeof applicationKey !== "string" ||
      !/^[a-zA-Z0-9-]{16,128}$/.test(applicationKey)
    ) {
      throw new BridgeError("Pair this bridge again to create groups.", 400);
    }
    if (!isRecord(body) || !isCreateGroupRequest(body.group)) {
      throw new BridgeError(
        "Enter a group name of 32 characters or fewer and a valid room archetype.",
        400,
      );
    }
    const update = createGroupUpdate(body.group);
    await sendBridgeCommand(
      address,
      id,
      applicationKey,
      update.path,
      update.body,
      update.method,
    );
    return bridgeResponse({ applied: 1 });
  } catch (error) {
    return bridgeFailure(error);
  }
}
