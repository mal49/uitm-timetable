"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { TimetableEntry } from "@/lib/types";

export type LayoutStyle = "wallpaper-table";
export type ThemeId =
  | "night"
  | "ios-default"
  | "light"
  | "gradient"
  | "glass"
  | "custom";
export type BackgroundMode = "style" | "colour" | "photo";
export type StyleId =
  | "paper-agenda"
  | "aurora-glass"
  | "heritage"
  | "pastel-bento"
  | "swiss-grid"
  | "dot-matrix"
  | "heritage-ivory"
  | "heritage-navy"
  | "heritage-noir"
  | "heritage-songket"
  | "heritage-almanac";
export type TableStyle = "grid" | "agenda" | "cards" | "timeline" | "dots" | "bento" | "heritage";
export type PhotoTreatment = "glass" | "scrim" | "tint" | "split";
export type WallpaperPhoto = { src: string; name: string; dark: boolean };
export type DensityLevel = "ultra-compact" | "compact" | "comfortable" | "spacious";
export type BorderStyle = "none" | "subtle" | "bold" | "rounded";
export type ShadowDepth = "none" | "subtle" | "medium" | "strong";
export type CornerRadius = "sharp" | "slightly-rounded" | "rounded" | "pill";

export interface WallpaperSettings {
  // Layout
  layoutStyle: LayoutStyle;
  
  // Background: a designed style, a colour theme over the week grid, or the user's photo
  backgroundMode: BackgroundMode;
  styleId: StyleId;
  themeId: ThemeId;
  customBackground?: string;
  tableStyle: TableStyle; // layout over a Colour or Photo background
  tableOffset: number; // vertical nudge of the timetable, % of wallpaper height (negative = up)
  photo?: WallpaperPhoto;
  recentPhotos: WallpaperPhoto[];
  photoTreatment: PhotoTreatment;
  photoBlur: number; // 0–100
  photoDim: number; // 0–100
  photoTextColor: "auto" | "light" | "dark";
  photoPositionY: number; // background-position y, 0–100
  
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
  orientation: "portrait"; // wallpapers are portrait-only; kept for the tuned week-grid sizing
  
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
  backgroundMode: "colour",
  styleId: "paper-agenda",
  themeId: "night",
  tableStyle: "grid",
  tableOffset: 0,
  recentPhotos: [],
  photoTreatment: "glass",
  photoBlur: 40,
  photoDim: 20,
  photoTextColor: "auto",
  photoPositionY: 50,
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
  orientation: "portrait",
  exportFormat: "png",
  exportQuality: 1.0,
};

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

export function WallpaperProvider({ 
  children,
  initialEntries = [],
  initialColorOverrides = {},
  initialSettings = {},
}: { 
  children: ReactNode;
  initialEntries?: TimetableEntry[];
  initialColorOverrides?: Record<string, string>;
  initialSettings?: Partial<WallpaperSettings>;
}) {
  const [settings, setSettings] = useState<WallpaperSettings>(() => ({ ...defaultSettings, ...initialSettings }));
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
