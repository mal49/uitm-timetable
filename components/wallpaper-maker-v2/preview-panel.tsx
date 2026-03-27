"use client";

import { useRef, useState } from "react";
import { toJpeg, toPng } from "html-to-image";
import Image from "next/image";
import { Smartphone, Download, Bolt, Camera, Wifi, BatteryFull, Signal, CalendarDays } from "lucide-react";
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

function formatLockscreenDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function formatLockscreenTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function PreviewPanel() {
  const { settings, updateSettings, entries, colorOverrides } = useWallpaper();
  const theme = getThemePreset(settings.themeId);
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const now = new Date();
  const lockDate = formatLockscreenDate(now);
  const lockTime = formatLockscreenTime(now);

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
  const lockscreenTextColor = theme.lockscreenTextColor ?? "#ffffff";
  const lockscreenTitleColor = theme.lockscreenTitleColor ?? lockscreenTextColor;
  const widgetTextColor = theme.id === "light" || theme.id === "glass" ? "#1f1a17" : "#ffffff";

  async function handleExport() {
    if (!exportRef.current || isExporting) {
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
          ? await toJpeg(exportRef.current, exportOptions)
          : await toPng(exportRef.current, exportOptions);

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
      <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Preview</h3>
        </div>
        
        {/* Orientation Toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => updateSettings({ orientation: "portrait" })}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              settings.orientation === "portrait"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Portrait
          </button>
          <button
            type="button"
            onClick={() => updateSettings({ orientation: "landscape" })}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              settings.orientation === "landscape"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
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
                      ref={exportRef}
                      className="absolute inset-0 overflow-hidden"
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
                          paddingTop: settings.showWidgetPosition ? "236px" : "172px",
                          paddingBottom: "74px",
                        }}
                      >
                        {renderLayout(settings.layoutStyle)}
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-6 pt-7">
                      <div
                        className="flex items-center justify-between text-[10px] font-medium tracking-[0.02em]"
                        style={{ color: lockscreenTextColor }}
                      >
                        <span>Fido</span>
                        <div className="flex items-center gap-1.5 opacity-90">
                          <Signal className="h-3 w-3" strokeWidth={2.2} />
                          <Wifi className="h-3 w-3" strokeWidth={2.2} />
                          <BatteryFull className="h-3.5 w-3.5" strokeWidth={2.2} />
                        </div>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 top-[98px] z-20 text-center">
                      <p
                        className="text-[13px] font-medium tracking-[0.01em] opacity-90"
                        style={{ color: lockscreenTitleColor }}
                      >
                        {lockDate}
                      </p>
                      <p
                        className="mt-1 text-[60px] font-semibold leading-none tracking-[-0.06em]"
                        style={{ color: lockscreenTextColor }}
                      >
                        {lockTime}
                      </p>
                    </div>

                    {settings.showWidgetPosition ? (
                      <div className="pointer-events-none absolute inset-x-0 top-[192px] z-20 flex justify-center">
                        <div
                          className="flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.10)] backdrop-blur-sm"
                          style={{
                            color: widgetTextColor,
                            background: "rgba(255,255,255,0.42)",
                            borderColor: "rgba(0,0,0,0.12)",
                          }}
                        >
                          <CalendarDays className="h-3.5 w-3.5" strokeWidth={2.1} />
                          <span className="text-[11px] font-semibold tracking-[0.01em]">
                            Widget Position
                          </span>
                        </div>
                      </div>
                    ) : null}

                    <div className="pointer-events-none absolute inset-x-0 bottom-9 z-20 flex items-center justify-between px-7">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/22 text-white shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-sm">
                        <Bolt className="h-4 w-4" strokeWidth={2.2} />
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/22 text-white shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-sm">
                        <Camera className="h-4 w-4" strokeWidth={2.2} />
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center">
                      <div className="h-1.5 w-28 rounded-full bg-white/85" />
                    </div>

                    <div
                      className="h-full w-full overflow-hidden"
                      style={{
                        boxSizing: "border-box",
                        paddingTop: settings.showWidgetPosition ? "236px" : "172px",
                        paddingBottom: "74px",
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
                      ref={exportRef}
                      className="absolute inset-0 overflow-hidden"
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
                          paddingTop: settings.showWidgetPosition ? "58px" : "42px",
                          paddingBottom: "16px",
                          paddingLeft: "10px",
                          paddingRight: landscapeRightPadding,
                        }}
                      >
                        {renderLayout(settings.layoutStyle)}
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-2">
                      <p
                        className="text-[9px] font-medium opacity-90"
                        style={{ color: lockscreenTitleColor }}
                      >
                        {lockDate}
                      </p>
                      <p
                        className="text-[28px] font-semibold leading-none tracking-[-0.05em]"
                        style={{ color: lockscreenTextColor }}
                      >
                        {lockTime}
                      </p>
                    </div>
                    {settings.showWidgetPosition ? (
                      <div className="pointer-events-none absolute inset-x-0 top-[34px] z-20 flex justify-center">
                        <div
                          className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-sm"
                          style={{
                            color: widgetTextColor,
                            background: "rgba(255,255,255,0.42)",
                            borderColor: "rgba(0,0,0,0.12)",
                          }}
                        >
                          <CalendarDays className="h-3 w-3" strokeWidth={2.1} />
                          <span className="text-[9px] font-semibold">Widget</span>
                        </div>
                      </div>
                    ) : null}
                    <div
                      className="wallpaper-preview-shell h-full w-full overflow-hidden"
                      style={{
                        boxSizing: "border-box",
                        paddingTop: settings.showWidgetPosition ? "58px" : "42px",
                        paddingBottom: "16px",
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
        <Button
          className="w-full rounded-full border-0 bg-[#21d4cf] font-semibold text-slate-950 shadow-[0_12px_24px_rgba(33,212,207,0.24)] hover:bg-[#3fe1dc]"
          size="lg"
          onClick={handleExport}
          disabled={isExporting}
        >
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
