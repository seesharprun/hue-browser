"use client";

import { useEffect, useState } from "react";
import {
  DARK_QUERY,
  DAY_THEME,
  NIGHT_THEME,
  storedTheme,
  systemTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from "../lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(NIGHT_THEME);

  useEffect(() => {
    setTheme(storedTheme() ?? systemTheme());

    /* Until the user picks a theme the page follows the system, so keep the
       toggle in step when the system setting changes while the page is open. */
    const media = window.matchMedia(DARK_QUERY);
    const onChange = () => {
      if (!storedTheme()) {
        setTheme(systemTheme());
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function toggle(isDay: boolean) {
    const next = isDay ? DAY_THEME : NIGHT_THEME;
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  }

  return (
    <label className="swap swap-rotate size-9 cursor-pointer rounded-full text-base-content/60 transition-colors hover:bg-base-200 hover:text-base-content">
      <input
        type="checkbox"
        className="theme-controller"
        aria-label="Toggle color theme"
        checked={theme === DAY_THEME}
        onChange={(event) => toggle(event.target.checked)}
      />
      <svg
        className="swap-off size-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Night</title>
        <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" />
      </svg>
      <svg
        className="swap-on size-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Day</title>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </label>
  );
}
