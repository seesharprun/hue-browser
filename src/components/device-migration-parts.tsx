import type { GroupKind } from "../lib/devices/migrations";
import { CloseIcon } from "./icons";

export const emptyValue = "__empty__";

type Option = { id: string; name: string };

export function MigrationHeader({
  titleId,
  onClose,
}: {
  titleId: string;
  onClose: () => void;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 id={titleId} className="text-lg font-semibold">
          Migrate devices
        </h2>
        <p className="text-sm text-base-content/70">
          Preview every device before moving a source group into another group
          or emptying it.
        </p>
      </div>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
        <CloseIcon /> Close
      </button>
    </div>
  );
}

export function MigrationFields({
  bridgeId,
  bridges,
  groupType,
  sourceId,
  sourceOptions,
  destination,
  destinationOptions,
  onBridge,
  onGroupType,
  onSource,
  onDestination,
}: {
  bridgeId: string;
  bridges: Option[];
  groupType: GroupKind;
  sourceId: string;
  sourceOptions: Option[];
  destination: string;
  destinationOptions: Option[];
  onBridge: (value: string) => void;
  onGroupType: (value: GroupKind) => void;
  onSource: (value: string) => void;
  onDestination: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Select
        label="Bridge"
        value={bridgeId}
        onChange={onBridge}
        options={bridges}
      />
      <label>
        <span className="label">Group type</span>
        <select
          className="select w-full"
          value={groupType}
          onChange={(event) => onGroupType(event.target.value as GroupKind)}
        >
          <option value="room">Rooms</option>
          <option value="zone">Zones</option>
        </select>
      </label>
      <Select
        label="Source"
        value={sourceId}
        onChange={onSource}
        options={sourceOptions}
      />
      <Select
        label="Destination"
        value={destination}
        onChange={onDestination}
        options={destinationOptions}
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="label">{label}</span>
      <select
        className="select w-full"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={options.length === 0}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function emptyLabel(groupType: GroupKind) {
  return groupType === "room"
    ? "Unassigned, empty source room"
    : "No destination, empty source zone";
}
