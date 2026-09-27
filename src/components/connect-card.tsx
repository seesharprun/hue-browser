"use client";

import { useEffect } from "react";
import type { ReturnTypeConnection } from "../lib/bridges/use-connection";
import { useToasts } from "../lib/ui/toasts";
import { BridgeActions } from "./bridge-actions";
import { PairedBridges } from "./paired-bridges";

export function ConnectCard({
  connection,
}: {
  connection: ReturnTypeConnection;
}) {
  const {
    saved,
    found,
    pending,
    busy,
    searching,
    ready,
    error,
    notice,
    search,
    select,
    pair,
    forget,
    reset,
    cancel,
  } = connection;
  const { notify } = useToasts();

  useEffect(() => {
    if (error) notify({ tone: "error", key: "connect", message: error });
  }, [error, notify]);

  useEffect(() => {
    if (notice) notify({ tone: "success", key: "connect", message: notice });
  }, [notice, notify]);

  return (
    <div className="card w-full max-w-md bg-base-200/90 backdrop-blur-sm">
      <div className="card-body gap-0">
        <h1 className="font-display text-3xl">
          {pending ? "Pair this bridge" : "Connect to a Philips Hue bridge"}
        </h1>
        {ready ? (
          <>
            <PairedBridges bridges={saved} onForget={forget} />
            {pending ? (
              <div className="mt-6 space-y-4">
                <p>
                  Press the button on{" "}
                  <strong>{pending.name ?? "this Philips Hue bridge"}</strong> (
                  {pending.address}), then pair within 30 seconds.
                </p>
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  onClick={pair}
                  disabled={busy}
                >
                  {busy && (
                    <span
                      aria-hidden="true"
                      className="loading loading-spinner loading-sm"
                    />
                  )}
                  {busy ? "Pairing..." : "Pair this bridge"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost w-full"
                  onClick={cancel}
                  disabled={busy}
                >
                  Use another bridge
                </button>
              </div>
            ) : (
              <BridgeActions
                busy={busy}
                searching={searching}
                found={found}
                onSearch={search}
                onSelect={select}
              />
            )}
          </>
        ) : error ? (
          <>
            <p className="mt-3 text-sm">
              Allow this site's browser storage or clear saved connections to
              continue.
            </p>
            <button
              type="button"
              className="btn btn-ghost mt-5"
              onClick={reset}
            >
              Clear saved bridges
            </button>
          </>
        ) : (
          <p className="mt-5 flex items-center gap-2 text-sm" role="status">
            <span
              aria-hidden="true"
              className="loading loading-ring loading-sm text-primary"
            />
            Loading saved bridges...
          </p>
        )}
      </div>
    </div>
  );
}
