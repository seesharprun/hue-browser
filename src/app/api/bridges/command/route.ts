import { sendBridgeCommand } from "../../../../lib/bridges/resources";
import {
  bridgeFailure,
  bridgeInput,
  bridgeResponse,
} from "../../../../lib/bridges/route-error";
import { BridgeError, isRecord } from "../../../../lib/bridges/types";
import { commandRequest, isCommand } from "../../../../lib/devices/commands";

export const runtime = "nodejs";

// The resource identifier is checked here so a client cannot aim a command at
// an arbitrary bridge path.
const RESOURCE = /^[a-f0-9-]{36}$/i;

export async function POST(request: Request) {
  try {
    const body = await request.clone().json();
    const { address, id, applicationKey } = await bridgeInput(request, true);
    if (
      typeof applicationKey !== "string" ||
      !/^[a-zA-Z0-9-]{16,128}$/.test(applicationKey)
    ) {
      throw new BridgeError(
        "Pair this bridge again to control its lights.",
        400,
      );
    }
    if (!isRecord(body) || !isCommand(body.command)) {
      throw new BridgeError("Choose a supported light command.", 400);
    }
    if (typeof body.resource !== "string" || !RESOURCE.test(body.resource)) {
      throw new BridgeError("Choose a device on this bridge.", 400);
    }
    const { path, body: payload } = commandRequest(body.command, body.resource);
    await sendBridgeCommand(address, id, applicationKey, path, payload);
    return bridgeResponse({ ok: true });
  } catch (error) {
    return bridgeFailure(error);
  }
}
