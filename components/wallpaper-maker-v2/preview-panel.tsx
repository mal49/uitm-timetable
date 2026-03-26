"use client";

import { useRef, useState } from "react";
import { toJpeg, toPng } from "html-to-image";
import Image from "next/image";
import { Smartphone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallpaper } from "./wallpaper-context";
import { getThemePreset } from "./themes/theme-presets";
import { cn } from "@/lib/utils";
import { CompactList } from "./layouts/compact-list";
import { TimelineView } from "./layouts/timeline-view";
import { DayCards } from "./layouts/day-cards";
import { MiniGrid } from "./layouts/mini-grid";
import { AgendaStyle } from "./layouts/agenda-style";
import { WallpaperTable } from "./layouts/wallpaper-table";
import type { LayoutStyle } from "./wallpaper-context";

function assertNever(value: never): never {
  throw new Error(`Unhandled layout style: ${String(value)}`);
}

function getLandscapeRightPadding(layoutStyle: LayoutStyle): string {
  switch (layoutStyle) {
    case "compact-list":
    case "timeline":
    case "day-cards":
      return "44px";
    case "agenda":
      return "36px";
    case "mini-grid":
      return "30px";
    case "wallpaper-table":
      return "24px";
    default:
      return assertNever(layoutStyle);
  }
}

export function PreviewPanel() {
  const { settings, updateSettings, entries, colorOverrides } = useWallpaper();
  const theme = getThemePreset(settings.themeId);
  const wallpaperRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Render the selected layout
  const renderLayout = (layoutStyle: LayoutStyle) => {
    const props = { entries, colorOverrides };
    
    switch (layoutStyle) {
      case "compact-list":
        return <CompactList {...props} />;
      case "timeline":
        return <TimelineView {...props} />;
      case "day-cards":
        return <DayCards {...props} />;
      case "mini-grid":
        return <MiniGrid {...props} />;
      case "agenda":
        return <AgendaStyle {...props} />;
      case "wallpaper-table":
        return <WallpaperTable {...props} />;
      default:
        return assertNever(layoutStyle);
    }
  };

  const fontWeightMap: Record<typeof settings.fontWeight, number> = {
    light: 300,
    regular: 400,
    medium: 500,
    bold: 700,
  };
  const landscapeRightPadding = getLandscapeRightPadding(settings.layoutStyle);

  async function handleExport() {
    if (!wallpaperRef.current || isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      const filenameBase = `uitm-timetable-${settings.layoutStyle}-${settings.orientation}`;
      const exportOptions = {
        pixelRatio: 2,
        quality: settings.exportQuality,
        // Prevent html-to-image font embedding crash when a stylesheet font entry is undefined.
        skipFonts: true,
      };

      const dataUrl =
        settings.exportFormat === "jpeg"
          ? await toJpeg(wallpaperRef.current, exportOptions)
          : await toPng(wallpaperRef.current, exportOptions);

      const link = document.createElement("a");
      link.download = `${filenameBase}.${settings.exportFormat}`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Preview</h3>
        </div>
        
        {/* Orientation Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
          <button
            type="button"
            onClick={() => updateSettings({ orientation: "portrait" })}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium transition-colors",
              settings.orientation === "portrait"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Portrait
          </button>
          <button
            type="button"
            onClick={() => updateSettings({ orientation: "landscape" })}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium transition-colors",
              settings.orientation === "landscape"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Landscape
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/30">
        <div className="h-full flex items-center justify-center">
          {/* Device Mockup Container */}
          <div className="relative">
            {settings.orientation === "portrait" ? (
              <div className="relative max-w-[360px] mx-auto">
                <Image
                  src="/misc/apple-iphone-15-black-portrait.png"
                  alt="iPhone Frame"
                  className="relative z-10 pointer-events-none w-full"
                  width={360}
                  height={780}
                />
                <div
                  className="absolute"
                  style={{
                    top: "3.2%",
                    left: "5.1%",
                    right: "5.1%",
                    bottom: "3.2%",
                    overflow: "hidden",
                    borderRadius: "42px",
                    clipPath: "inset(0 round 42px)",
                  }}
                >
                  <div
                    ref={wallpaperRef}
                    className="w-full h-full relative overflow-hidden"
                    style={{
                      background: theme.background,
                      fontSize: `${settings.fontSize}em`,
                      fontWeight: fontWeightMap[settings.fontWeight],
                      borderRadius: "42px",
                      clipPath: "inset(0 round 42px)",
                    }}
                  >
                    <div
                      className="h-full w-full overflow-hidden"
                      style={{
                        boxSizing: "border-box",
                        paddingTop: "56px",
                        paddingBottom: "14px",
                      }}
                    >
                      {renderLayout(settings.layoutStyle)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative max-w-[520px] mx-auto">
                <Image
                  src="/misc/apple-iphone-15-black-landscape.png"
                  alt="iPhone Landscape Frame"
                  className="relative z-10 pointer-events-none w-full"
                  width={520}
                  height={260}
                />
                <div
                  className="absolute"
                  style={{
                    top: "5.8%",
                    left: "2.8%",
                    right: "2.8%",
                    bottom: "5.8%",
                    overflow: "hidden",
                    borderRadius: "24px",
                    clipPath: "inset(0 round 24px)",
                  }}
                >
                  <div
                    ref={wallpaperRef}
                    className="w-full h-full relative overflow-hidden"
                    style={{
                      background: theme.background,
                      fontSize: `${settings.fontSize}em`,
                      fontWeight: fontWeightMap[settings.fontWeight],
                      borderRadius: "24px",
                      clipPath: "inset(0 round 24px)",
                    }}
                  >
                    <div
                      className="wallpaper-preview-shell h-full w-full overflow-hidden"
                      style={{
                        boxSizing: "border-box",
                        paddingTop: "12px",
                        paddingBottom: "12px",
                        paddingLeft: "10px",
                        paddingRight: landscapeRightPadding,
                      }}
                    >
                      {renderLayout(settings.layoutStyle)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Carousel Dots */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-foreground/25" />
              <span className="h-2 w-2 rounded-full bg-foreground/60" />
              <span className="h-2 w-2 rounded-full bg-foreground/25" />
            </div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="px-4 sm:px-5 py-4 border-t border-border">
        <Button className="w-full" size="lg" onClick={handleExport} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export Wallpaper"}
        </Button>
      </div>

      <style jsx>{`
        .wallpaper-preview-shell,
        .wallpaper-preview-shell * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .wallpaper-preview-shell *::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
      `}</style>
    </div>
  );
}
