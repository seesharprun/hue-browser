import {
  getBridgeResources,
  sendBridgeCommand,
} from "../../../../lib/bridges/resources";
import {
  bridgeFailure,
  bridgeInput,
  bridgeResponse,
} from "../../../../lib/bridges/route-error";
import { BridgeError, isRecord } from "../../../../lib/bridges/types";
import { isEditRequest, planEdits } from "../../../../lib/devices/edits";
import { DeviceDataError, readResources } from "../../../../lib/devices/groups";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.clone().json();
    const { address, id, applicationKey } = await bridgeInput(request, true);
    if (
      typeof applicationKey !== "string" ||
      !/^[a-zA-Z0-9-]{16,128}$/.test(applicationKey)
    ) {
      throw new BridgeError("Pair this bridge again to edit its devices.", 400);
    }
    if (!isRecord(body) || !isEditRequest(body.edit)) {
      throw new BridgeError(
        "Enter a name of 32 characters or fewer and choose rooms or zones on this bridge.",
        400,
      );
    }
    // Membership is a whole-array replacement, so the current lists are read
    // immediately before the change to limit the chance of clobbering edits.
    const resources = readResources(
      await getBridgeResources(address, id, applicationKey),
    );
    const updates = planEdits(resources, body.edit);
    // The bridge has no transactions, so updates apply one at a time and a
    // failure leaves the earlier ones in place.
    for (const update of updates) {
      await sendBridgeCommand(
        address,
        id,
        applicationKey,
        update.path,
        update.body,
        update.method,
      );
    }
    return bridgeResponse({ applied: updates.length });
  } catch (error) {
    if (error instanceof DeviceDataError)
      return bridgeFailure(new BridgeError(error.message, 502));
    return bridgeFailure(error);
  }
}
