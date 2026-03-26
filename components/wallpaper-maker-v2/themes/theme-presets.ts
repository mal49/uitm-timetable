import type { ThemeId } from "../wallpaper-context";

export interface ThemePreset {
  id: ThemeId;
  name: string;
  description: string;
  background: string;
  lockscreenTextColor?: string;
  lockscreenTitleColor?: string;
  overlayBackground?: string;
  overlayTextColor?: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "ios-default",
    name: "iOS Default",
    description: "Clean gradient with blur effect",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    lockscreenTextColor: "#ffffff",
    lockscreenTitleColor: "#ffffff",
    overlayBackground: "rgba(255, 255, 255, 0.95)",
    overlayTextColor: "#0f172a",
  },
  {
    id: "dark",
    name: "Dark Mode",
    description: "Deep dark with subtle accents",
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    lockscreenTextColor: "#f8fafc",
    lockscreenTitleColor: "#f8fafc",
    overlayBackground: "rgba(30, 41, 59, 0.95)",
    overlayTextColor: "#f8fafc",
  },
  {
    id: "light",
    name: "Light & Clean",
    description: "Soft and minimal",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    lockscreenTextColor: "#0f172a",
    lockscreenTitleColor: "#1e293b",
    overlayBackground: "rgba(255, 255, 255, 0.95)",
    overlayTextColor: "#0f172a",
  },
  {
    id: "gradient",
    name: "Gradient Aurora",
    description: "Vibrant gradient",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    lockscreenTextColor: "#ffffff",
    lockscreenTitleColor: "#ffffff",
    overlayBackground: "rgba(255, 255, 255, 0.95)",
    overlayTextColor: "#0f172a",
  },
  {
    id: "solid",
    name: "Solid Colors",
    description: "Clean solid background",
    background: "linear-gradient(135deg, #4f46e5 0%, #4f46e5 100%)",
    lockscreenTextColor: "#ffffff",
    lockscreenTitleColor: "#ffffff",
    overlayBackground: "rgba(255, 255, 255, 0.95)",
    overlayTextColor: "#0f172a",
  },
  {
    id: "glass",
    name: "Glassmorphism",
    description: "Frosted glass effect",
    background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
    lockscreenTextColor: "#0f172a",
    lockscreenTitleColor: "#1e293b",
    overlayBackground: "rgba(255, 255, 255, 0.8)",
    overlayTextColor: "#0f172a",
  },
];

export function getThemePreset(id: ThemeId): ThemePreset {
  return THEME_PRESETS.find(t => t.id === id) ?? THEME_PRESETS[0]!;
}
