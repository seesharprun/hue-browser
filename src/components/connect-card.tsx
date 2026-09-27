"use client";

import { useConnection } from "../lib/bridges/use-connection";
import { BridgeActions } from "./bridge-actions";
import { PairedBridges } from "./paired-bridges";

export function ConnectCard() {
  const connection = useConnection();
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

  return (
    <div className="card w-full max-w-md bg-base-200/90 backdrop-blur-sm">
      <div className="card-body gap-0">
        <h1 className="font-display text-3xl">
          Connect to a Philips Hue bridge
        </h1>
        {error && (
          <p role="alert" className="mt-4 text-sm text-error">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mt-4 text-sm text-success">
            {notice}
          </p>
        )}
        {ready ? (
          <>
            <PairedBridges bridges={saved} onForget={forget} />
            {pending ? (
              <div className="mt-7 space-y-4">
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
          <p className="mt-5 text-sm" role="status">
            Loading saved bridges...
          </p>
        )}
      </div>
    </div>
  );
}
