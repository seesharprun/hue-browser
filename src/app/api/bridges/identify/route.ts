import {
  bridgeFailure,
  bridgeInput,
  bridgeResponse,
} from "../../../../lib/bridges/route-error";
import { identifyBridge } from "../../../../lib/bridges/transport";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { address } = await bridgeInput(request);
    return bridgeResponse(await identifyBridge(address));
  } catch (error) {
    return bridgeFailure(error);
  }
}
