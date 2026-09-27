export function mdnsQuery(service = "_hue._tcp.local"): Buffer {
  const labels = service.split(".");
  const name = Buffer.concat([
    ...labels.map((label) =>
      Buffer.from([label.length, ...Buffer.from(label)]),
    ),
    Buffer.from([0]),
  ]);
  const header = Buffer.from([0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]);
  const question = Buffer.from([0, 12, 0x80, 1]);
  return Buffer.concat([header, name, question]);
}
