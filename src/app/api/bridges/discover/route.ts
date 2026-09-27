import { discoverBridges } from "../../../../lib/bridges/discovery";
import {
  bridgeFailure,
  bridgeResponse,
} from "../../../../lib/bridges/route-error";

export const runtime = "nodejs";

export async function GET() {
  try {
    return bridgeResponse(await discoverBridges());
  } catch (error) {
    return bridgeFailure(error);
  }
}
