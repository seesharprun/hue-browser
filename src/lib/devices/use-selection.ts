"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { rowKey } from "./pending.ts";
import {
  allSelected,
  applyRange,
  pruneToVisible,
  rangeBetween,
  someSelected,
  toggleAllKeys,
  toggleKey,
} from "./selection.ts";
import type { DeviceRow } from "./types.ts";

/**
 * Row selection for the device table. Keys are the same `bridgeId:id` pair
 * used by the pending-edit store, so selection and drafts never collide.
 */
export function useSelection(visible: DeviceRow[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Shift-click ranges anchor on the last row clicked without the modifier.
  const anchor = useRef<string | null>(null);

  useEffect(() => {
    setSelected((current) => pruneToVisible(current, visible.map(rowKey)));
  }, [visible]);

  const toggleRow = useCallback(
    (row: DeviceRow, rows: DeviceRow[], shiftKey: boolean) => {
      const key = rowKey(row);
      setSelected((current) => {
        const range = shiftKey
          ? rangeBetween(rows.map(rowKey), anchor.current, key)
          : null;
        return range
          ? applyRange(current, range, key)
          : toggleKey(current, key);
      });
      anchor.current = key;
    },
    [],
  );

  const toggleAll = useCallback(
    (rows: DeviceRow[]) =>
      setSelected((current) => toggleAllKeys(current, rows.map(rowKey))),
    [],
  );

  const clear = useCallback(() => setSelected(new Set()), []);

  return {
    count: selected.size,
    isSelected: (row: DeviceRow) => selected.has(rowKey(row)),
    toggleRow,
    toggleAll,
    allSelected: (rows: DeviceRow[]) => allSelected(selected, rows.map(rowKey)),
    someSelected: (rows: DeviceRow[]) =>
      someSelected(selected, rows.map(rowKey)),
    rowsIn: (rows: DeviceRow[]) =>
      rows.filter((row) => selected.has(rowKey(row))),
    clear,
  };
}

export type Selection = ReturnType<typeof useSelection>;
