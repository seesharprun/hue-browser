import {
  bridgeFailure,
  bridgeInput,
  bridgeResponse,
} from "../../../../lib/bridges/route-error";
import { pairBridge } from "../../../../lib/bridges/transport";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { address, id } = await bridgeInput(request, true);
    return bridgeResponse(await pairBridge(address, id));
  } catch (error) {
    return bridgeFailure(error);
  }
}
