"use client";

import { useId, useState } from "react";
import {
  applyBridgeMigration,
  previewMigration,
} from "../lib/bridges/migration-browser";
import type { PairedBridge } from "../lib/bridges/types";
import type {
  MigrationDevice,
  MigrationResult,
} from "../lib/devices/migrations";
import type { BridgeGroups } from "../lib/devices/use-devices";
import { useToasts } from "../lib/ui/toasts";
import {
  emptyLabel,
  emptyValue,
  MigrationFields,
  MigrationHeader,
} from "./device-migration-parts";
import { MigrationReview, resultSummary } from "./device-migration-review";
import { useMigrationState } from "./device-migration-state";

type Props = {
  bridges: PairedBridge[];
  groups: BridgeGroups;
  open: boolean;
  onClose: () => void;
  onDone: () => void;
};

export function DeviceMigrationModal(props: Props) {
  const { bridges, groups, open, onClose, onDone } = props;
  const titleId = useId();
  const [preview, setPreview] = useState<MigrationDevice[] | null>(null);
  const [results, setResults] = useState<MigrationResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { notify } = useToasts();

  function reset() {
    setPreview(null);
    setResults(null);
    setError("");
  }

  const selection = useMigrationState(bridges, groups, reset);
  const canApply =
    !!preview?.length &&
    (!results || results.some((item) => item.status !== "moved"));

  if (!open) return null;

  async function loadPreview() {
    if (!selection.bridge || !selection.sourceId) return;
    setBusy(true);
    setError("");
    try {
      setPreview(await previewMigration(selection.bridge, selection.migration));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not preview migration.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function applyMigration() {
    if (!selection.bridge || !preview) return;
    setBusy(true);
    setError("");
    try {
      const next = await applyBridgeMigration(
        selection.bridge,
        selection.migration,
      );
      setResults(next);
      onDone();
      notify({
        tone: "success",
        key: "migration",
        message: resultSummary(next),
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not migrate devices.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="modal modal-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <div className="modal-box max-w-2xl">
        <MigrationHeader titleId={titleId} onClose={onClose} />
        <MigrationFields
          bridgeId={selection.selectedBridgeId}
          bridges={bridges.map((item) => ({
            id: item.id,
            name: item.name ?? item.address,
          }))}
          groupType={selection.groupType}
          sourceId={selection.sourceId}
          sourceOptions={selection.sourceOptions}
          destination={selection.destination}
          destinationOptions={[
            { id: emptyValue, name: emptyLabel(selection.groupType) },
            ...selection.destinationOptions,
          ]}
          onBridge={selection.setBridge}
          onGroupType={selection.setGroupType}
          onSource={selection.setSource}
          onDestination={selection.setDestination}
        />
        <MigrationReview
          error={error}
          devices={preview}
          results={results}
          groupType={selection.groupType}
          busy={busy}
          canPreview={!!selection.bridge && !!selection.sourceId}
          canApply={canApply}
          onPreview={loadPreview}
          onApply={applyMigration}
        />
      </div>
    </div>
  );
}
