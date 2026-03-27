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
    description: "Warm lock screen with soft paper tones",
    background:
      "radial-gradient(circle at top, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0) 28%), linear-gradient(180deg, #ded7cb 0%, #d7cfbe 52%, #ccc3b2 100%)",
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
    overlayBackground: "rgba(255, 244, 250, 0.93)",
    overlayTextColor: "#4a1d46",
  },
  {
    id: "solid",
    name: "Solid Colors",
    description: "Clean solid background",
    background: "#4f46e5",
    lockscreenTextColor: "#ffffff",
    lockscreenTitleColor: "#ffffff",
    overlayBackground: "rgba(238, 240, 255, 0.94)",
    overlayTextColor: "#27296d",
  },
  {
    id: "glass",
    name: "Glassmorphism",
    description: "Frosted glass effect",
    background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
    lockscreenTextColor: "#0f172a",
    lockscreenTitleColor: "#1e293b",
    overlayBackground: "rgba(255, 255, 255, 0.72)",
    overlayTextColor: "#162033",
  },
  {
    id: "midnight",
    name: "Midnight Blue",
    description: "Flat navy backdrop with crisp contrast",
    background: "#1d3557",
    lockscreenTextColor: "#f8fafc",
    lockscreenTitleColor: "#f8fafc",
    overlayBackground: "rgba(239, 246, 255, 0.94)",
    overlayTextColor: "#14253d",
  },
  {
    id: "evergreen",
    name: "Evergreen",
    description: "Flat green with a calm editorial feel",
    background: "#1f5f4a",
    lockscreenTextColor: "#f8fafc",
    lockscreenTitleColor: "#f8fafc",
    overlayBackground: "rgba(240, 253, 247, 0.94)",
    overlayTextColor: "#12392d",
  },
  {
    id: "terracotta",
    name: "Terracotta",
    description: "Warm flat clay tone",
    background: "#c65d3b",
    lockscreenTextColor: "#fff7ed",
    lockscreenTitleColor: "#fff7ed",
    overlayBackground: "rgba(255, 247, 237, 0.94)",
    overlayTextColor: "#6f2f1d",
  },
];

export function getThemePreset(id: ThemeId): ThemePreset {
  return THEME_PRESETS.find(t => t.id === id) ?? THEME_PRESETS[0]!;
}
