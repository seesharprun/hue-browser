const { test: testTheme }: typeof import("node:test") = require("node:test");
const themeAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  DARK_QUERY,
  DAY_THEME,
  NIGHT_THEME,
  THEME_STORAGE_KEY,
  storedTheme,
  systemTheme,
  themeInitScript,
}: typeof import("./theme") = require("./theme.ts");

function withThemeStorage(value: string | null, run: () => void) {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => value },
  });
  try {
    run();
  } finally {
    Reflect.deleteProperty(globalThis, "localStorage");
  }
}

testTheme("reads only recognised stored themes", () => {
  withThemeStorage(NIGHT_THEME, () =>
    themeAssert.equal(storedTheme(), NIGHT_THEME),
  );
  withThemeStorage(DAY_THEME, () =>
    themeAssert.equal(storedTheme(), DAY_THEME),
  );
  withThemeStorage("neon", () => themeAssert.equal(storedTheme(), null));
});

testTheme("detects the system theme and emits a guarded init script", () => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      matchMedia: (query: string) => ({ matches: query === DARK_QUERY }),
    },
  });
  try {
    themeAssert.equal(systemTheme(), NIGHT_THEME);
    themeAssert.match(themeInitScript, new RegExp(THEME_STORAGE_KEY));
    themeAssert.match(themeInitScript, new RegExp(DAY_THEME));
    themeAssert.match(themeInitScript, new RegExp(NIGHT_THEME));
  } finally {
    Reflect.deleteProperty(globalThis, "window");
  }
});
