import { BridgeError, isBridgeId, isLocalAddress, isRecord } from "./types.ts";

export async function bridgeInput(request: Request, needsId = false) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    throw new BridgeError("Send a JSON request.", 415);
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new BridgeError("Send valid JSON.", 400);
  }
  if (!isRecord(body) || !isLocalAddress(body.address)) {
    throw new BridgeError("Enter a local IPv4 bridge address.", 400);
  }
  if (needsId && !isBridgeId(body.id)) {
    throw new BridgeError("Choose a valid Philips Hue bridge.", 400);
  }
  return {
    address: body.address,
    id: typeof body.id === "string" ? body.id : "",
    applicationKey: body.applicationKey,
    body,
  };
}

export function bridgeResponse(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export function bridgeFailure(error: unknown) {
  if (error instanceof BridgeError) {
    return bridgeResponse({ error: error.message }, error.status);
  }
  console.error("Unexpected Philips Hue bridge API failure:", error);
  return bridgeResponse({ error: "Something went wrong. Try again." }, 500);
}
