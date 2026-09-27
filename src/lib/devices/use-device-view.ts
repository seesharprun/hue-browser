"use client";

import { useMemo, useState } from "react";
import { type ColumnKey, column, columns } from "./columns";
import {
  compare,
  type Filters,
  facets,
  groupOrder,
  matches,
} from "./filtering";
import type { DeviceRow } from "./types";

export type GroupBy = "room" | "zones" | "none";
export type Direction = "asc" | "desc";
export type Sort = { key: ColumnKey; direction: Direction };
export type { Filters };

export function useDeviceView(rows: DeviceRow[]) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [sort, setSort] = useState<Sort>({ key: "name", direction: "asc" });
  const [group, setGroup] = useState<GroupBy>("room");
  const [focus, setFocus] = useState<string | null>(null);

  const term = query.toLowerCase().trim();

  const visible = useMemo(() => {
    const matched = rows.filter((row) => matches(row, term, filters));
    const order = column(sort.key);
    return matched.sort((a, b) => {
      const result = compare(order.display(a), order.display(b));
      return sort.direction === "asc" ? result : -result;
    });
  }, [rows, term, filters, sort]);

  const groups = useMemo(() => {
    if (group === "none")
      return [
        {
          key: "all",
          title: "",
          rows: visible,
          options: facets(rows, term, filters),
        },
      ];
    const held = new Map<string, DeviceRow[]>();
    for (const row of visible) {
      // A device in several zones is listed under each of them.
      for (const value of column(group).values(row)) {
        held.set(value, [...(held.get(value) ?? []), row]);
      }
    }
    return [...held.entries()]
      .sort(([a], [b]) => groupOrder(a, b))
      .map(([key, items]) => ({
        key,
        title: key,
        rows: items,
        options: facets(
          rows.filter((row) => column(group).values(row).includes(key)),
          term,
          filters,
        ),
      }));
  }, [rows, visible, group, term, filters]);

  function toggleSort(key: ColumnKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  }

  function toggleFilter(key: ColumnKey, value: string) {
    setFilters((current) => {
      const selected = current[key] ?? [];
      return {
        ...current,
        [key]: selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value],
      };
    });
  }

  function clearFilter(key: ColumnKey) {
    setFilters((current) => ({ ...current, [key]: [] }));
  }

  function clearAll() {
    setFilters({});
    setQuery("");
  }

  /** Following a room or zone tag switches grouping and scrolls to that group. */
  function focusGroup(key: GroupBy, value: string) {
    setGroup(key);
    setFocus(value);
  }

  const active = columns.some((item) => filters[item.key]?.length) || !!query;

  // The grouped column repeats the group heading on every row, so it is hidden.
  const visibleColumns = columns.filter((item) => item.key !== group);

  return {
    query,
    setQuery,
    filters,
    sort,
    group,
    setGroup,
    visible,
    visibleColumns,
    groups,
    active,
    focus,
    focusGroup,
    clearFocus: () => setFocus(null),
    toggleSort,
    toggleFilter,
    clearFilter,
    clearAll,
  };
}

export type DeviceView = ReturnType<typeof useDeviceView>;
