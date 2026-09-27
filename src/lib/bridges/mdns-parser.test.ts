const { test }: typeof import("node:test") = require("node:test");
const assert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  parseMdnsResponse,
}: typeof import("./mdns-parser") = require("./mdns-parser.ts");
const { mdnsQuery }: typeof import("./mdns") = require("./mdns.ts");

test("builds a Philips Hue mDNS service query", () => {
  const query = mdnsQuery();
  assert.equal(query.readUInt16BE(4), 1);
  assert.equal(query.includes(Buffer.from("_hue")), true);
  assert.equal(query.readUInt16BE(query.length - 4), 12);
  assert.equal(query.readUInt16BE(query.length - 2), 0x8001);
});

test("parses Philips Hue mDNS bridge identities and local addresses", () => {
  assert.deepEqual(
    parseMdnsResponse(
      response([
        ptr("_hue._tcp.local", "Kitchen._hue._tcp.local"),
        txt("Kitchen._hue._tcp.local", "bridgeid=001788FFFE123ABC"),
        srv("Kitchen._hue._tcp.local", "philips-hue.local"),
        a("philips-hue.local", "192.168.1.2"),
      ]),
    ),
    [{ id: "001788fffe123abc", address: "192.168.1.2" }],
  );
});

test("ignores invalid mDNS bridge records", () => {
  assert.deepEqual(
    parseMdnsResponse(
      response([
        ptr("_hue._tcp.local", "001788FFFE123ABC._hue._tcp.local"),
        srv("001788FFFE123ABC._hue._tcp.local", "public.local"),
        a("public.local", "8.8.8.8"),
      ]),
    ),
    [],
  );
  assert.deepEqual(parseMdnsResponse(Buffer.from([0, 1, 2])), []);
  assert.deepEqual(
    parseMdnsResponse(
      Buffer.concat([
        Buffer.from([0, 0, 0x84, 0, 0, 0, 0, 1, 0, 0, 0, 0]),
        encodeName("truncated.local"),
      ]),
    ),
    [],
  );
  assert.deepEqual(
    parseMdnsResponse(
      response([record("_hue._tcp.local", 12, Buffer.from([0xc0]))]),
    ),
    [],
  );
});

function response(records: Buffer[]) {
  return Buffer.concat([
    Buffer.from([0, 0, 0x84, 0, 0, 1, 0, records.length, 0, 0, 0, 0]),
    question("_hue._tcp.local"),
    ...records,
  ]);
}

function question(name: string) {
  return Buffer.concat([encodeName(name), Buffer.from([0, 12, 0, 1])]);
}

function ptr(name: string, value: string) {
  return record(name, 12, encodeName(value));
}

function txt(name: string, value: string) {
  const text = Buffer.from(value);
  return record(name, 16, Buffer.concat([Buffer.from([text.length]), text]));
}

function srv(name: string, target: string) {
  return record(
    name,
    33,
    Buffer.concat([Buffer.from([0, 0, 0, 0, 1, 187]), encodeName(target)]),
  );
}

function a(name: string, address: string) {
  return record(name, 1, Buffer.from(address.split(".").map(Number)));
}

function record(name: string, type: number, data: Buffer) {
  const header = Buffer.alloc(10);
  header.writeUInt16BE(type, 0);
  header.writeUInt16BE(1, 2);
  header.writeUInt16BE(data.length, 8);
  return Buffer.concat([encodeName(name), header, data]);
}

function encodeName(name: string) {
  return Buffer.concat([
    ...name
      .split(".")
      .map((label) => Buffer.from([label.length, ...Buffer.from(label)])),
    Buffer.from([0]),
  ]);
}
