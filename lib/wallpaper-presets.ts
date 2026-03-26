import type { CSSProperties } from "react";

export type WallpaperDeviceId = "iphone14" | "iphone14pro" | "ipad102";

export type WallpaperBackgroundId =
  | "solidGraphite"
  | "solidMint"
  | "gradientAurora"
  | "gradientSunset"
  | "patternDots"
  | "patternGrid";

export type WallpaperOverlayMode = "grid" | "table";

export type WallpaperOrientation = "portrait" | "landscape";

export interface WallpaperDevicePreset {
  id: WallpaperDeviceId;
  label: string;
  widthPx: number;
  heightPx: number;
  /** Border radius for lockscreen frame aesthetic (export still clipped). */
  frameRadiusPx: number;
}

export interface WallpaperBackgroundPreset {
  id: WallpaperBackgroundId;
  label: string;
  style: CSSProperties;
}

export const WALLPAPER_DEVICES: WallpaperDevicePreset[] = [
  {
    id: "iphone14",
    label: "iPhone (1170x2532)",
    widthPx: 1170,
    heightPx: 2532,
    frameRadiusPx: 78,
  },
  {
    id: "iphone14pro",
    // Pro models are slightly different, but keeping a close portrait ratio works well.
    label: "iPhone Pro (1179x2556)",
    widthPx: 1179,
    heightPx: 2556,
    frameRadiusPx: 78,
  },
  {
    id: "ipad102",
    label: "iPad (1536x2048)",
    widthPx: 1536,
    heightPx: 2048,
    frameRadiusPx: 96,
  },
];

export const WALLPAPER_BACKGROUNDS: WallpaperBackgroundPreset[] = [
  {
    id: "solidGraphite",
    label: "Graphite",
    style: { backgroundColor: "#0b1220" },
  },
  {
    id: "solidMint",
    label: "Mint",
    style: { backgroundColor: "#042f2e" },
  },
  {
    id: "gradientAurora",
    label: "Aurora Gradient",
    style: {
      backgroundImage:
        "radial-gradient(1000px circle at 15% 10%, rgba(34,197,94,0.35), transparent 40%), radial-gradient(900px circle at 85% 20%, rgba(59,130,246,0.35), transparent 35%), linear-gradient(180deg, #081326 0%, #06101d 100%)",
    },
  },
  {
    id: "gradientSunset",
    label: "Sunset Gradient",
    style: {
      backgroundImage:
        "radial-gradient(1000px circle at 10% 10%, rgba(249,115,22,0.35), transparent 40%), radial-gradient(900px circle at 90% 20%, rgba(239,68,68,0.32), transparent 35%), linear-gradient(180deg, #1a0b1e 0%, #0b1220 100%)",
    },
  },
  {
    id: "patternDots",
    label: "Dot Pattern",
    style: {
      backgroundImage:
        "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)",
      backgroundSize: "18px 18px",
      backgroundColor: "#070c16",
    },
  },
  {
    id: "patternGrid",
    label: "Grid Pattern",
    style: {
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)",
      backgroundSize: "22px 22px",
      backgroundColor: "#060b14",
    },
  },
];

export function getDevicePreset(id: WallpaperDeviceId): WallpaperDevicePreset {
  const device = WALLPAPER_DEVICES.find((d) => d.id === id);
  if (!device) throw new Error(`Unknown wallpaper device preset: ${id}`);
  return device;
}

export function getOrientedDevicePreset(
  device: WallpaperDevicePreset,
  orientation: WallpaperOrientation
): WallpaperDevicePreset {
  if (orientation === "portrait") return device;

  // Landscape is a rotated lockscreen; we swap canvas dimensions.
  return {
    ...device,
    widthPx: device.heightPx,
    heightPx: device.widthPx,
    // Keep the same radius proportions; the canvas is already clipped.
    label: `${device.label} (Landscape)`,
  };
}

export function getBackgroundPreset(id: WallpaperBackgroundId): WallpaperBackgroundPreset {
  const bg = WALLPAPER_BACKGROUNDS.find((b) => b.id === id);
  if (!bg) throw new Error(`Unknown wallpaper background preset: ${id}`);
  return bg;
}

