const {
  test: testSelection,
}: typeof import("node:test") = require("node:test");
const selectionAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  allSelected,
  applyRange,
  pruneToVisible,
  rangeBetween,
  someSelected,
  toggleAllKeys,
  toggleKey,
}: typeof import("./selection") = require("./selection.ts");

testSelection("toggles a single key in and back out", () => {
  const added = toggleKey(new Set(), "a:1");
  selectionAssert.ok(added.has("a:1"));
  const removed = toggleKey(added, "a:1");
  selectionAssert.equal(removed.size, 0);
});

testSelection("finds the inclusive span between two keys in row order", () => {
  const keys = ["a", "b", "c", "d"];
  selectionAssert.deepEqual(rangeBetween(keys, "b", "d"), ["b", "c", "d"]);
  selectionAssert.deepEqual(rangeBetween(keys, "d", "b"), ["b", "c", "d"]);
});

testSelection("has no range without an anchor or an unknown key", () => {
  const keys = ["a", "b", "c"];
  selectionAssert.equal(rangeBetween(keys, null, "b"), null);
  selectionAssert.equal(rangeBetween(keys, "a", "z"), null);
});

testSelection("a shift-click range extends the clicked row's own state", () => {
  const range = ["b", "c", "d"];
  const selected = applyRange(new Set(), range, "d");
  selectionAssert.deepEqual([...selected].sort(), ["b", "c", "d"]);
  const cleared = applyRange(selected, range, "d");
  selectionAssert.equal(cleared.size, 0);
});

testSelection(
  "the header checkbox selects everything shown, then clears it",
  () => {
    const keys = ["a", "b"];
    const selected = toggleAllKeys(new Set(), keys);
    selectionAssert.ok(allSelected(selected, keys));
    const cleared = toggleAllKeys(selected, keys);
    selectionAssert.equal(cleared.size, 0);
  },
);

testSelection("reports a partial selection as indeterminate", () => {
  const selected = new Set(["a"]);
  const keys = ["a", "b"];
  selectionAssert.ok(someSelected(selected, keys));
  selectionAssert.ok(!allSelected(selected, keys));
});

testSelection("drops rows that leave the filtered view", () => {
  const selected = new Set(["a", "b", "c"]);
  const pruned = pruneToVisible(selected, ["a", "c"]);
  selectionAssert.deepEqual([...pruned].sort(), ["a", "c"]);
});

testSelection("keeps the same set instance when nothing is pruned", () => {
  const selected = new Set(["a", "b"]);
  selectionAssert.equal(pruneToVisible(selected, ["a", "b", "z"]), selected);
});
