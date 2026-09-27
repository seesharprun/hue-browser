import { discoverBridges } from "../../../../lib/bridges/discovery.ts";
import {
  bridgeFailure,
  bridgeResponse,
} from "../../../../lib/bridges/route-error.ts";

export const runtime = "nodejs";

export async function GET() {
  try {
    return bridgeResponse(await discoverBridges());
  } catch (error) {
    return bridgeFailure(error);
  }
}
