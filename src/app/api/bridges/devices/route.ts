import { getBridgeResources } from "../../../../lib/bridges/resources";
import {
  bridgeFailure,
  bridgeInput,
  bridgeResponse,
} from "../../../../lib/bridges/route-error";
import { BridgeError } from "../../../../lib/bridges/types";
import { DeviceDataError, deviceRows } from "../../../../lib/devices/parse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { address, id, applicationKey } = await bridgeInput(request, true);
    if (
      typeof applicationKey !== "string" ||
      !/^[a-zA-Z0-9-]{16,128}$/.test(applicationKey)
    ) {
      throw new BridgeError("Pair this bridge again to load its devices.", 400);
    }
    const resources = await getBridgeResources(address, id, applicationKey);
    return bridgeResponse(
      deviceRows(resources, id.toLowerCase(), id.toLowerCase()),
    );
  } catch (error) {
    if (error instanceof DeviceDataError)
      return bridgeFailure(new BridgeError(error.message, 502));
    return bridgeFailure(error);
  }
}
