export const NIGHT_THEME = "lofi-art-night";
export const DAY_THEME = "lofi-art-day";
export const THEME_STORAGE_KEY = "hue-browser-theme";
export const DARK_QUERY = "(prefers-color-scheme: dark)";

export type Theme = typeof NIGHT_THEME | typeof DAY_THEME;

/* Applies a previously chosen theme before the first paint so the page never
   flashes the wrong one while React hydrates. When nothing has been chosen the
   attribute is deliberately left off, which lets the daisyUI `default` and
   `prefersdark` themes follow the operating system on their own. */
export const themeInitScript = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="${DAY_THEME}"||t==="${NIGHT_THEME}"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}`;

export function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === DAY_THEME || value === NIGHT_THEME ? value : null;
  } catch {
    return null;
  }
}

export function systemTheme(): Theme {
  return window.matchMedia(DARK_QUERY).matches ? NIGHT_THEME : DAY_THEME;
}
