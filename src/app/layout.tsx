import type { Metadata } from "next";
import { ThemeToggle } from "../components/theme-toggle";
import { themeInitScript } from "../lib/theme";
import { ToastProvider } from "../lib/ui/toasts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hue Browser",
  description: "Manage Philips Hue bridges, rooms, and devices",
};

/* The saved preference is applied before hydration; without one daisyUI
   follows the system color scheme. Only the root data-theme may differ from
   server markup, so suppress that expected hydration warning here. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: the theme must be applied before the first paint
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <header className="sticky top-0 z-40 flex h-16 items-center gap-3 bg-base-100/90 px-4 backdrop-blur md:px-6">
            <span className="min-w-0 truncate font-semibold text-base">
              Hue Browser
            </span>
            <div className="flex-1" />
            <ThemeToggle />
          </header>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
