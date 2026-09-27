"use client";

import type { Toast } from "../lib/ui/toasts";
import { CloseIcon, ToneIcon } from "./icons";

const styles: Record<Toast["tone"], string> = {
  info: "alert-info",
  success: "alert-success",
  warning: "alert-warning",
  error: "alert-error",
};

const headings: Record<Toast["tone"], string> = {
  info: "Heads up",
  success: "Done",
  warning: "Warning",
  error: "Error",
};

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    // Wide enough that a bridge error reads as one line on a laptop screen.
    <div className="toast toast-center toast-bottom z-50 w-full max-w-5xl px-4">
      {toasts.map((item) => {
        const body = (
          <>
            <ToneIcon tone={item.tone} label={headings[item.tone]} />
            <strong className="text-sm">{headings[item.tone]}</strong>
            <span className="grow text-center text-sm">{item.message}</span>
            {item.sticky ? (
              <button
                type="button"
                className="btn btn-circle btn-ghost btn-xs"
                onClick={() => onDismiss(item.id)}
              >
                <CloseIcon />
                <span className="sr-only">Dismiss</span>
              </button>
            ) : (
              // Balances the dismiss button so the message stays centered.
              <span aria-hidden="true" className="size-4 shrink-0" />
            )}
          </>
        );
        const style = `alert ${styles[item.tone]} flex w-full items-center gap-3 shadow-lg`;
        // Problems interrupt; confirmations wait for a pause in the reading.
        return item.sticky ? (
          <div key={item.id} role="alert" className={style}>
            {body}
          </div>
        ) : (
          <output key={item.id} className={style}>
            {body}
          </output>
        );
      })}
    </div>
  );
}
