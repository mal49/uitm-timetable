// Main wallpaper maker component
export { WallpaperMaker } from "./wallpaper-maker";
export type { WallpaperMakerProps } from "./wallpaper-maker";

// Context and hooks
export { WallpaperProvider, useWallpaper } from "./wallpaper-context";
export type {
  LayoutStyle,
  ThemeId,
  DensityLevel,
  BorderStyle,
  ShadowDepth,
  CornerRadius,
  WallpaperSettings,
} from "./wallpaper-context";

// Layout component
export { WallpaperTable } from "./layouts/wallpaper-table";
