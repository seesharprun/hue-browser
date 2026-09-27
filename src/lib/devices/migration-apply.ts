import type { MigrationResult, PlannedDevice } from "./migrations.ts";

export async function applyMigration(
  planned: PlannedDevice[],
  send: (path: string, body: unknown) => Promise<void>,
) {
  const results: MigrationResult[] = [];
  for (const [index, device] of planned.entries()) {
    try {
      for (const update of device.updates) await send(update.path, update.body);
      results.push({ id: device.id, name: device.name, status: "moved" });
    } catch (cause) {
      results.push({
        id: device.id,
        name: device.name,
        status: "failed",
        error:
          cause instanceof Error ? cause.message : "The bridge request failed.",
      });
      for (const skipped of planned.slice(index + 1)) {
        results.push({ id: skipped.id, name: skipped.name, status: "skipped" });
      }
      break;
    }
  }
  return results;
}
