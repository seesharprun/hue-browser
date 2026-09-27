import { type BridgeCandidate, isBridgeId, isLocalAddress } from "./types.ts";

const TYPE_A = 1;
const TYPE_PTR = 12;
const TYPE_TXT = 16;
const TYPE_SRV = 33;
const CLASS_IN = 1;

type Service = {
  bridgeId: string | null;
  target: string | null;
};

export function parseMdnsResponse(message: Buffer): BridgeCandidate[] {
  if (message.length < 12) return [];
  let offset = 12;
  for (let index = 0; index < message.readUInt16BE(4); index += 1) {
    offset = readName(message, offset).offset + 4;
  }
  const services = new Map<string, Service>();
  const addresses = new Map<string, Set<string>>();
  const records =
    message.readUInt16BE(6) +
    message.readUInt16BE(8) +
    message.readUInt16BE(10);
  for (
    let index = 0;
    index < records && offset + 10 <= message.length;
    index += 1
  ) {
    const name = readName(message, offset);
    offset = name.offset;
    const type = message.readUInt16BE(offset);
    const klass = message.readUInt16BE(offset + 2) & 0x7fff;
    const length = message.readUInt16BE(offset + 8);
    const data = offset + 10;
    offset = data + length;
    if (klass !== CLASS_IN || offset > message.length) continue;
    collectRecord(message, data, length, type, name.value, services, addresses);
  }
  return candidatesFromRecords(services, addresses);
}

function collectRecord(
  message: Buffer,
  data: number,
  length: number,
  type: number,
  name: string,
  services: Map<string, Service>,
  addresses: Map<string, Set<string>>,
) {
  if (type === TYPE_PTR) {
    serviceFor(services, readName(message, data).value);
  } else if (type === TYPE_TXT) {
    serviceFor(services, name).bridgeId = bridgeIdFromTxt(
      message,
      data,
      length,
    );
  } else if (type === TYPE_SRV && length >= 7) {
    serviceFor(services, name).target = readName(message, data + 6).value;
  } else if (type === TYPE_A && length === 4) {
    const address = [...message.subarray(data, data + 4)].join(".");
    if (!addresses.has(name)) addresses.set(name, new Set());
    addresses.get(name)?.add(address);
  }
}

function candidatesFromRecords(
  services: Map<string, Service>,
  addresses: Map<string, Set<string>>,
) {
  const candidates: BridgeCandidate[] = [];
  for (const [name, service] of services) {
    const id = service.bridgeId ?? bridgeIdFromName(name);
    const values = service.target ? addresses.get(service.target) : undefined;
    if (!id || !values) continue;
    for (const address of values) {
      if (isBridgeId(id) && isLocalAddress(address)) {
        candidates.push({ id: id.toLowerCase(), address });
      }
    }
  }
  return candidates;
}

function serviceFor(services: Map<string, Service>, name: string): Service {
  const current = services.get(name);
  if (current) return current;
  const service = { bridgeId: null, target: null };
  services.set(name, service);
  return service;
}

function bridgeIdFromTxt(message: Buffer, offset: number, length: number) {
  let cursor = offset;
  while (cursor < offset + length) {
    const size = message[cursor];
    const end = cursor + 1 + size;
    if (end > offset + length) break;
    const text = message.subarray(cursor + 1, end).toString("utf8");
    const [, value] = /^bridgeid=([a-f0-9]{16})$/i.exec(text) ?? [];
    if (value) return value;
    cursor = end;
  }
  return null;
}

function bridgeIdFromName(name: string) {
  return /(^|\.)([a-f0-9]{16})(\.|$)/i.exec(name)?.[2] ?? null;
}

function readName(
  message: Buffer,
  offset: number,
  seen = 0,
): {
  value: string;
  offset: number;
} {
  if (seen > 8 || offset >= message.length) return { value: "", offset };
  const labels: string[] = [];
  let cursor = offset;
  while (cursor < message.length) {
    const length = message[cursor];
    if ((length & 0xc0) === 0xc0) {
      const pointer = ((length & 0x3f) << 8) | message[cursor + 1];
      labels.push(readName(message, pointer, seen + 1).value);
      return { value: clean(labels), offset: cursor + 2 };
    }
    cursor += 1;
    if (length === 0) return { value: clean(labels), offset: cursor };
    labels.push(message.subarray(cursor, cursor + length).toString("utf8"));
    cursor += length;
  }
  return { value: clean(labels), offset: cursor };
}

function clean(labels: string[]) {
  return labels.filter(Boolean).join(".").toLowerCase();
}
