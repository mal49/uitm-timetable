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
      <div className="flex flex-col lg:grid lg:grid-cols-[400px_1fr] gap-0">
        {/* Settings Panel (Left) */}
        <div className="border-b lg:border-b-0 lg:border-r border-border bg-background">
          <SettingsPanel />
        </div>

        {/* Preview Panel (Right) */}
        <div className="bg-background">
          <PreviewPanel />
        </div>
      </div>
    </WallpaperProvider>
  );
}
