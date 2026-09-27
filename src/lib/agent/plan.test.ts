const { test: testPlan }: typeof import("node:test") = require("node:test");
const planAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  describePlan,
  extractJson,
  parsePlan,
  planIssue,
}: typeof import("./plan") = require("./plan.ts");

testPlan(
  "accepts the words a model reaches for instead of the field name",
  () => {
    planAssert.equal(
      parsePlan('{"field":"rename","template":"Candle {n}"}')?.field,
      "name",
    );
    planAssert.equal(
      parsePlan('{"field":"zone","value":"Downstairs"}')?.field,
      "zones",
    );
  },
);

testPlan("repairs single quotes and trailing commas from the model", () => {
  const plan = parsePlan("{'field': 'name', 'template': 'Candle {n}',}");
  planAssert.deepEqual(plan, {
    field: "name",
    template: "Candle {n}",
    filter: undefined,
  });
});

testPlan("explains a template that would collapse every name", () => {
  const issue = planIssue('{"field":"name","template":"Candle"}');
  planAssert.match(String(issue), /same name/);
});

testPlan("explains a change that was cut off mid-object", () => {
  const issue = planIssue('{"field":"name","template":"Candle {n}"');
  planAssert.match(String(issue), /cut off/);
});

testPlan("stays quiet for ordinary conversation", () => {
  planAssert.equal(planIssue("How would you like them named?"), null);
});

testPlan("pulls a plan out of a sentence wrapped around it", () => {
  const plan = parsePlan(
    'Sure, here you go. {"field":"name","template":"{room} {n}"} Let me know.',
  );
  planAssert.deepEqual(plan, {
    field: "name",
    template: "{room} {n}",
    filter: undefined,
  });
});

testPlan("keeps nested braces balanced when extracting", () => {
  planAssert.equal(extractJson('x {"a":{"b":1}} y'), '{"a":{"b":1}}');
});

testPlan("treats ordinary conversation as having no plan", () => {
  planAssert.equal(parsePlan("How about grouping them by floor?"), null);
  planAssert.equal(parsePlan(""), null);
});

testPlan("rejects a rename that carries no token", () => {
  // Without a token every device would collapse onto the same name.
  planAssert.equal(parsePlan('{"field":"name","template":"Lamp"}'), null);
});

testPlan("rejects a plan that changes two fields at once", () => {
  planAssert.equal(
    parsePlan('{"field":"name","template":"{room} {n}","value":"Kitchen"}'),
    null,
  );
});

testPlan("rejects an unknown field", () => {
  planAssert.equal(parsePlan('{"field":"brightness","value":"50"}'), null);
});

testPlan("reads a filter and drops one that is incomplete", () => {
  const scoped = parsePlan(
    '{"field":"room","value":"Kitchen","filter":{"field":"type","value":"light"}}',
  );
  planAssert.deepEqual(scoped?.filter, { field: "type", value: "light" });
  const loose = parsePlan(
    '{"field":"room","value":"Kitchen","filter":{"field":"colour","value":"red"}}',
  );
  planAssert.equal(loose?.filter, undefined);
});

testPlan("defaults a zone plan to adding membership", () => {
  planAssert.equal(
    parsePlan('{"field":"zones","value":"Down"}')?.action,
    "add",
  );
  planAssert.equal(
    parsePlan('{"field":"zones","value":"Down","action":"remove"}')?.action,
    "remove",
  );
});

testPlan("survives malformed json", () => {
  planAssert.equal(parsePlan('{"field":"name",'), null);
});

testPlan("describes a plan in plain language", () => {
  planAssert.equal(
    describePlan({ field: "name", template: "{room} {n}" }),
    "Rename to {room} {n}",
  );
  planAssert.equal(
    describePlan({
      field: "zones",
      value: "Downstairs",
      action: "remove",
      filter: { field: "room", value: "Kitchen" },
    }),
    "Remove from zone Downstairs where room is Kitchen",
  );
});
