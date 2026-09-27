import type {
  GroupKind,
  MigrationDevice,
  MigrationResult,
} from "../lib/devices/migrations";
import { GroupIcon, SaveIcon } from "./icons";

export function MigrationReview({
  error,
  devices,
  results,
  groupType,
  busy,
  canPreview,
  canApply,
  onPreview,
  onApply,
}: {
  error: string;
  devices: MigrationDevice[] | null;
  results: MigrationResult[] | null;
  groupType: GroupKind;
  busy: boolean;
  canPreview: boolean;
  canApply: boolean;
  onPreview: () => void;
  onApply: () => void;
}) {
  return (
    <>
      {error && <p className="mt-3 text-sm text-error">{error}</p>}
      <Preview devices={devices} results={results} />
      <div className="modal-action">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onPreview}
          disabled={!canPreview || busy}
        >
          <GroupIcon
            name={groupType === "room" ? "room" : "zones"}
            label="Preview"
          />{" "}
          Preview
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onApply}
          disabled={!canApply || busy}
        >
          {busy ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <SaveIcon />
          )}{" "}
          Move devices
        </button>
      </div>
    </>
  );
}

function Preview({
  devices,
  results,
}: {
  devices: MigrationDevice[] | null;
  results: MigrationResult[] | null;
}) {
  if (!devices) return null;
  if (devices.length === 0) {
    return <p className="mt-4 text-sm">The source group is already empty.</p>;
  }
  const byId = new Map(results?.map((item) => [item.id, item]));
  return (
    <ul className="mt-4 max-h-56 overflow-auto rounded-box border border-base-content/10 bg-base-200 p-2 text-sm">
      {devices.map((device) => (
        <li
          key={device.id}
          className="flex justify-between gap-3 rounded px-2 py-1"
        >
          <span>{device.name}</span>
          <span className="text-base-content/70">
            {byId.get(device.id)?.status ?? "will move"}
          </span>
        </li>
      ))}
    </ul>
  );
}

const count = (value: number, singular: string) =>
  `${value} ${value === 1 ? singular : `${singular}s`}`;

export function resultSummary(results: MigrationResult[]) {
  const moved = results.filter((item) => item.status === "moved").length;
  const failed = results.filter((item) => item.status === "failed").length;
  const skipped = results.filter((item) => item.status === "skipped").length;
  if (!failed && !skipped) return `Moved ${count(moved, "device")}.`;
  return [
    `Moved ${count(moved, "device")}`,
    failed ? `${count(failed, "device")} failed` : "",
    skipped ? `${count(skipped, "device")} skipped` : "",
  ]
    .filter(Boolean)
    .join("; ");
}
