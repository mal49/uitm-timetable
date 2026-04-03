"use client";

import { useRef, useState } from "react";
import { toBlob } from "html-to-image";
import Image from "next/image";
import {
  Smartphone,
  Download,
  Bolt,
  Camera,
  Wifi,
  BatteryFull,
  Signal,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallpaper } from "./wallpaper-context";
import { getThemePreset } from "./themes/theme-presets";
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

const PORTRAIT_EXPORT_SIZE = {
  width: 390,
  height: 844,
};

const PORTRAIT_TOP_PADDING = "198px";
const PORTRAIT_TOP_PADDING_WITH_WIDGET = "238px";
const PORTRAIT_BOTTOM_PADDING = "92px";

export function PreviewPanel() {
  const { settings, entries, colorOverrides } = useWallpaper();
  const theme = getThemePreset(settings.themeId, settings.customBackground);
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const now = new Date();
  const lockDate = formatLockscreenDate(now);
  const lockTime = formatLockscreenTime(now);

  // Render the selected layout
  const renderLayout = (
    layoutStyle: LayoutStyle,
    renderMode: "preview" | "export",
  ) => {
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
        return <WallpaperTable {...props} renderMode={renderMode} />;
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
  const lockscreenTextColor = theme.lockscreenTextColor ?? "#ffffff";
  const lockscreenTitleColor =
    theme.lockscreenTitleColor ?? lockscreenTextColor;
  const widgetTextColor = lockscreenTextColor;
  const widgetBorderColor =
    widgetTextColor === "#0F172A"
      ? "rgba(15,23,42,0.14)"
      : "rgba(255,255,255,0.24)";
  const exportSize = PORTRAIT_EXPORT_SIZE;

  async function handleExport() {
    if (!exportRef.current || isExporting) {
      return;
    }

    setExportError("");
    setIsExporting(true);

    try {
      const filenameBase = `uitm-class-canvas-${settings.layoutStyle}-${settings.orientation}`;
      const exportOptions = {
        pixelRatio: 3,
        quality: settings.exportQuality,
        cacheBust: true,
        // Prevent html-to-image font embedding crash when a stylesheet font entry is undefined.
        skipFonts: true,
        type: settings.exportFormat === "jpeg" ? "image/jpeg" : "image/png",
      };

      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      const blob = await toBlob(exportRef.current, exportOptions);
      if (!blob) {
        throw new Error("Failed to render wallpaper image.");
      }

      const dataUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${filenameBase}.${settings.exportFormat}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(dataUrl), 1500);
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "Failed to export wallpaper.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  const wallpaperScene = (
    <div
      className="relative overflow-hidden"
      style={{
        width: exportSize.width,
        height: exportSize.height,
        background: theme.background,
        fontSize: `${settings.fontSize}em`,
        fontWeight: fontWeightMap[settings.fontWeight],
      }}>
      <div
        className="h-full w-full overflow-hidden"
        style={{
          boxSizing: "border-box",
          paddingTop: settings.showWidgetPosition
            ? PORTRAIT_TOP_PADDING_WITH_WIDGET
            : PORTRAIT_TOP_PADDING,
          paddingBottom: PORTRAIT_BOTTOM_PADDING,
        }}>
        {renderLayout(settings.layoutStyle, "export")}
      </div>
    </div>
  );

  return (
    <div className="relative h-full min-h-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Preview</h3>
        </div>

        <div className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          Portrait
        </div>
      </div>

      {/* Preview Area */}
      <div className="min-h-0 flex-1 overflow-auto bg-muted/30 p-4 sm:p-6">
        <div className="h-full flex items-center justify-center">
          {/* Device Mockup Container */}
          <div className="relative">
            <div className="relative w-full max-w-98 mx-auto">
              <Image
                src="/misc/apple-iphone-15-black-portrait.png"
                alt="iPhone Frame"
                className="relative z-10 pointer-events-none w-full"
                width={392}
                height={849}
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
                }}>
                <div
                  className="w-full h-full relative overflow-hidden"
                  style={{
                    background: theme.background,
                    fontSize: `${settings.fontSize}em`,
                    fontWeight: fontWeightMap[settings.fontWeight],
                    borderRadius: "42px",
                    clipPath: "inset(0 round 42px)",
                  }}>
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      background: theme.background,
                      fontSize: `${settings.fontSize}em`,
                      fontWeight: fontWeightMap[settings.fontWeight],
                      borderRadius: "42px",
                      clipPath: "inset(0 round 42px)",
                    }}>
                    <div
                      className="h-full w-full overflow-hidden"
                      style={{
                        boxSizing: "border-box",
                        paddingTop: settings.showWidgetPosition
                          ? PORTRAIT_TOP_PADDING_WITH_WIDGET
                          : PORTRAIT_TOP_PADDING,
                        paddingBottom: PORTRAIT_BOTTOM_PADDING,
                      }}>
                      {renderLayout(settings.layoutStyle, "preview")}
                    </div>
                  </div>

                  <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-6 pt-7">
                    <div
                      className="flex items-center justify-between text-[10px] font-medium tracking-[0.02em]"
                      style={{ color: lockscreenTextColor }}>
                      <span>Fido</span>
                      <div className="flex items-center gap-1.5 opacity-90">
                        <Signal className="h-3 w-3" strokeWidth={2.2} />
                        <Wifi className="h-3 w-3" strokeWidth={2.2} />
                        <BatteryFull
                          className="h-3.5 w-3.5"
                          strokeWidth={2.2}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute inset-x-0 top-24.5 z-20 text-center">
                    <p
                      className="text-[13px] font-medium tracking-[0.01em] opacity-90"
                      style={{ color: lockscreenTitleColor }}>
                      {lockDate}
                    </p>
                    <p
                      className="mt-1 text-[60px] font-semibold leading-none tracking-[-0.06em]"
                      style={{ color: lockscreenTextColor }}>
                      {lockTime}
                    </p>
                  </div>

                  {settings.showWidgetPosition ? (
                    <div className="pointer-events-none absolute inset-x-0 top-48 z-20 flex justify-center">
                      <div
                        className="flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.10)] backdrop-blur-sm"
                        style={{
                          color: widgetTextColor,
                          background: "rgba(255,255,255,0.42)",
                          borderColor: widgetBorderColor,
                        }}>
                        <CalendarDays
                          className="h-3.5 w-3.5"
                          strokeWidth={2.1}
                        />
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
                </div>
              </div>
            </div>

            {/* Carousel Dots */}
            <div className="pointer-events-none mt-6 flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-foreground/25" />
              <span className="h-2 w-2 rounded-full bg-foreground/60" />
              <span className="h-2 w-2 rounded-full bg-foreground/25" />
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="fixed -left-2499.75 top-0 pointer-events-none opacity-0">
        <div ref={exportRef}>{wallpaperScene}</div>
      </div>

      {exportError ? (
        <div className="border-t border-border px-4 py-3 text-sm text-red-600 sm:px-5">
          {exportError}
        </div>
      ) : null}

      {/* Export Button */}
      <div className="relative z-30 border-t border-border bg-background px-4 py-4 sm:px-5">
        <Button
          className="relative z-30 w-full rounded-full border-0 bg-[#21d4cf] font-semibold text-slate-950 shadow-[0_12px_24px_rgba(33,212,207,0.24)] hover:bg-[#3fe1dc]"
          size="lg"
          onClick={handleExport}
          disabled={isExporting}>
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
