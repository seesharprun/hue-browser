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
import { DeviceDataError, readResources } from "../../../../lib/devices/groups";
import {
  applyMigration,
  isMigrationRequest,
  planMigration,
} from "../../../../lib/devices/migrations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.clone().json();
    const { address, id, applicationKey } = await bridgeInput(request, true);
    if (
      typeof applicationKey !== "string" ||
      !/^[a-zA-Z0-9-]{16,128}$/.test(applicationKey)
    ) {
      throw new BridgeError("Pair this bridge again to migrate its devices.", 400);
    }
    if (!isRecord(body) || !isMigrationRequest(body.migration)) {
      throw new BridgeError("Choose a source group and destination on this bridge.", 400);
    }

    const resources = readResources(
      await getBridgeResources(address, id, applicationKey),
    );
    const planned = planMigration(resources, body.migration);
    const devices = planned.map(({ id: deviceId, name }) => ({ id: deviceId, name }));
    if (body.preview === true) return bridgeResponse({ devices });

    const results = await applyMigration(planned, (path, update) =>
      sendBridgeCommand(address, id, applicationKey, path, update),
    );
    return bridgeResponse({ results });
  } catch (error) {
    if (error instanceof DeviceDataError)
      return bridgeFailure(new BridgeError(error.message, 502));
    return bridgeFailure(error);
  }
}
