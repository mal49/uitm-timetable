"use client";

import type { ReactNode } from "react";

import type {
  WallpaperBackgroundPreset,
  WallpaperDevicePreset,
  WallpaperOrientation,
} from "@/lib/wallpaper-presets";

export interface WallpaperCanvasProps {
  device: WallpaperDevicePreset;
  background: WallpaperBackgroundPreset;
  orientation?: WallpaperOrientation;
  title?: string;
  dateText?: string;
  timeText?: string;
  showTitle?: boolean;
  showDate?: boolean;
  showTime?: boolean;
  /**
   * Main timetable overlay content.
   * It should be self-contained and sized for the lockscreen canvas area.
   */
  overlay: ReactNode;
  /** Optional footer area if you want extra branding/labels. */
  footer?: ReactNode;
}

export function WallpaperCanvas({
  device,
  background,
  orientation = "portrait",
  title,
  dateText,
  timeText,
  showTitle = true,
  showDate = false,
  showTime = true,
  overlay,
  footer,
}: WallpaperCanvasProps) {
  const isLandscape = orientation === "landscape";
  const isIpad = device.id.startsWith("ipad");

  // The exported device preset swaps width/height for landscape.
  // To keep the lockscreen typography/layout correct, we render the
  // lockscreen "as portrait" inside an inner wrapper and rotate it.
  const innerWidthPx = isLandscape ? device.heightPx : device.widthPx;
  const innerHeightPx = isLandscape ? device.widthPx : device.heightPx;

  const topPadding = isIpad ? 104 : 86;
  const headerHeight = isIpad ? 190 : 176;
  const overlayRadiusPx = Math.max(16, Math.round(device.frameRadiusPx * 0.4));

  const rotateStyle: React.CSSProperties | undefined = isLandscape
    ? {
        transform: "rotate(90deg) translateY(-100%)",
        transformOrigin: "top left",
      }
    : undefined;

  return (
    <div
      style={{
        width: device.widthPx,
        height: device.heightPx,
        borderRadius: device.frameRadiusPx,
      }}
      className="relative overflow-hidden shadow-[0_18px_80px_rgba(0,0,0,0.45)]"
    >
      <div
        className="relative text-white"
        style={{
          width: innerWidthPx,
          height: innerHeightPx,
          ...rotateStyle,
        }}
      >
        {/* Background - soft beige/cream like reference */}
        <div 
          aria-hidden="true" 
          style={{
            ...background.style,
            background: "linear-gradient(135deg, #f0e8dc 0%, #f5ede3 100%)",
          }} 
          className="absolute inset-0" 
        />

        {/* Subtle vignette */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px circle at 50% -200px, rgba(255,255,255,0.06), rgba(0,0,0,0) 55%), linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative w-full h-full">
          <div
            className="px-10"
            style={{
              paddingTop: topPadding,
              height: headerHeight,
            }}
          >
            <div className="drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
              {showDate && dateText ? (
                <div className={`${isIpad ? "text-[22px]" : "text-[18px]"} font-semibold opacity-90`}>
                  {dateText}
                </div>
              ) : null}

              {showTime && timeText ? (
                <div
                  className={`${
                    isIpad ? "text-[92px]" : "text-[82px]"
                  } font-black leading-[0.92] tracking-tight`}
                >
                  {timeText}
                </div>
              ) : null}

              {showTitle && title ? (
                <div className={`${isIpad ? "mt-3 text-[22px]" : "mt-2.5 text-[18px]"} font-semibold opacity-90`}>
                  {title}
                </div>
              ) : null}
            </div>
          </div>

          {/* Timetable overlay - centered in the middle */}
          <div
            className="absolute left-0 right-0 flex items-center justify-center"
            style={{
              top: headerHeight + 4,
              bottom: 32,
              padding: isIpad ? 16 : 12,
            }}
          >
            <div
              className="w-full h-full overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.95)",
                border: "2px solid rgba(15, 23, 42, 0.1)",
                borderRadius: overlayRadiusPx,
                boxShadow: "0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <div className="w-full h-full p-3">{overlay}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

