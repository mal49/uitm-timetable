"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

// next-themes injects a <script> tag server-side for FOUC prevention.
// React 19 warns about script tags in the component tree even though this is
// intentional and safe. Suppress just this specific warning until next-themes
// ships a React 19-compatible fix.
if (typeof console !== "undefined") {
  const _originalError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    _originalError(...args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
