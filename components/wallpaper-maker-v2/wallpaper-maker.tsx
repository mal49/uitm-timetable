"use client";

import { WallpaperProvider } from "./wallpaper-context";
import { SettingsPanel } from "./settings-panel";
import { PreviewPanel } from "./preview-panel";
import type { TimetableEntry } from "@/lib/types";

export interface WallpaperMakerProps {
  entries: TimetableEntry[];
  colorOverrides?: Record<string, string>;
}

export function WallpaperMaker({ entries, colorOverrides = {} }: WallpaperMakerProps) {
  return (
    <WallpaperProvider initialEntries={entries} initialColorOverrides={colorOverrides}>
      <div className="flex min-h-[calc(100dvh-132px)] flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_400px]">
        <PreviewPanel />
        <aside aria-label="Wallpaper settings" className="border-t border-border bg-card lg:border-t-0 lg:border-l">
          <SettingsPanel />
        </aside>
      </div>
    </WallpaperProvider>
  );
}
