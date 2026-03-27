"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { TimetableEntry } from "@/lib/types";

export type LayoutStyle =
  | "compact-list"
  | "timeline"
  | "day-cards"
  | "mini-grid"
  | "agenda"
  | "wallpaper-table";
export type ThemeId =
  | "ios-default"
  | "light"
  | "gradient"
  | "solid"
  | "glass"
  | "midnight"
  | "evergreen"
  | "terracotta"
  | "custom";
export type DensityLevel = "ultra-compact" | "compact" | "comfortable" | "spacious";
export type BorderStyle = "none" | "subtle" | "bold" | "rounded";
export type ShadowDepth = "none" | "subtle" | "medium" | "strong";
export type CornerRadius = "sharp" | "slightly-rounded" | "rounded" | "pill";

export interface WallpaperSettings {
  // Layout
  layoutStyle: LayoutStyle;
  
  // Theme
  themeId: ThemeId;
  customBackground?: string;
  
  // Colors
  subjectColors: Record<string, string>;
  backgroundColor?: string;
  textColor?: string;
  autoContrast: boolean;
  
  // Typography
  fontSize: number; // 0.8 to 1.4 (multiplier)
  fontWeight: "light" | "regular" | "medium" | "bold";
  titleText: string;
  
  // Visibility
  showCourseCode: boolean;
  showCourseName: boolean;
  showTime: boolean;
  showVenue: boolean;
  showLecturer: boolean;
  showDayLabels: boolean;
  showTimeIndicators: boolean;
  showWidgetPosition: boolean;
  
  // Density
  density: DensityLevel;
  
  // Visual Style
  borderStyle: BorderStyle;
  shadowDepth: ShadowDepth;
  cornerRadius: CornerRadius;
  showIcons: boolean;
  showDividers: boolean;
  
  // Device
  deviceId: string;
  orientation: "portrait" | "landscape";
  
  // Export
  exportFormat: "png" | "jpeg";
  exportQuality: number; // 0.8 to 1.0
}

interface WallpaperContextType {
  settings: WallpaperSettings;
  updateSettings: (updates: Partial<WallpaperSettings>) => void;
  resetSettings: () => void;
  entries: TimetableEntry[];
  setEntries: (entries: TimetableEntry[]) => void;
  colorOverrides: Record<string, string>;
  updateColorOverride: (subjectKey: string, color: string) => void;
  resetColorOverrides: () => void;
}

const defaultSettings: WallpaperSettings = {
  layoutStyle: "wallpaper-table",
  themeId: "ios-default",
  subjectColors: {},
  autoContrast: true,
  fontSize: 1,
  fontWeight: "regular",
  titleText: "Class Canvas",
  showCourseCode: true,
  showCourseName: false,
  showTime: true,
  showVenue: true,
  showLecturer: false,
  showDayLabels: true,
  showTimeIndicators: true,
  showWidgetPosition: true,
  density: "compact",
  borderStyle: "subtle",
  shadowDepth: "subtle",
  cornerRadius: "rounded",
  showIcons: false,
  showDividers: true,
  deviceId: "iphone15pro",
  orientation: "portrait",
  exportFormat: "png",
  exportQuality: 1.0,
};

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

export function WallpaperProvider({ 
  children,
  initialEntries = [],
  initialColorOverrides = {}
}: { 
  children: ReactNode;
  initialEntries?: TimetableEntry[];
  initialColorOverrides?: Record<string, string>;
}) {
  const [settings, setSettings] = useState<WallpaperSettings>(defaultSettings);
  const [entries, setEntries] = useState<TimetableEntry[]>(initialEntries);
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>(initialColorOverrides);

  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  useEffect(() => {
    setColorOverrides(initialColorOverrides);
  }, [initialColorOverrides]);

  const updateSettings = useCallback((updates: Partial<WallpaperSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const updateColorOverride = useCallback((subjectKey: string, color: string) => {
    setColorOverrides((prev) => ({
      ...prev,
      [subjectKey]: color,
    }));
  }, []);

  const resetColorOverrides = useCallback(() => {
    setColorOverrides(initialColorOverrides);
  }, [initialColorOverrides]);

  return (
    <WallpaperContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        entries,
        setEntries,
        colorOverrides,
        updateColorOverride,
        resetColorOverrides,
      }}
    >
      {children}
    </WallpaperContext.Provider>
  );
}

export function useWallpaper() {
  const context = useContext(WallpaperContext);
  if (!context) {
    throw new Error("useWallpaper must be used within WallpaperProvider");
  }
  return context;
}
