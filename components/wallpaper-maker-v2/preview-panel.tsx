"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { toBlob } from "html-to-image";
import Image from "next/image";
import {
  BatteryFull,
  Bolt,
  CalendarDays,
  Camera,
  Download,
  Signal,
  Smartphone,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWallpaper } from "./wallpaper-context";
import { WallpaperTable } from "./layouts/wallpaper-table";
import { getThemePreset } from "./themes/theme-presets";

const PORTRAIT_EXPORT_SIZE = { width: 390, height: 844 };
const LANDSCAPE_EXPORT_SIZE = { width: 844, height: 390 };

type PreviewConfig = {
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  maxWidthClassName: string;
  screenInset: {
    top: string;
    left: string;
    right: string;
    bottom: string;
  };
  screenRadius: string;
  contentPadding: {
    top: string;
    topWithWidget: string;
    bottom: string;
    left?: string;
    right?: string;
  };
};

const PORTRAIT_PREVIEW_CONFIG: PreviewConfig = {
  imageSrc: "/misc/apple-iphone-15-black-portrait.png",
  imageAlt: "iPhone Frame",
  imageWidth: 392,
  imageHeight: 849,
  maxWidthClassName: "max-w-98",
  screenInset: {
    top: "3.2%",
    left: "5.1%",
    right: "5.1%",
    bottom: "3.2%",
  },
  screenRadius: "42px",
  contentPadding: {
    top: "198px",
    topWithWidget: "238px",
    bottom: "92px",
  },
};

const LANDSCAPE_PREVIEW_CONFIG: PreviewConfig = {
  imageSrc: "/misc/apple-iphone-15-black-landscape.png",
  imageAlt: "iPhone Landscape Frame",
  imageWidth: 520,
  imageHeight: 260,
  maxWidthClassName: "max-w-130",
  screenInset: {
    top: "5.8%",
    left: "2.8%",
    right: "2.8%",
    bottom: "5.8%",
  },
  screenRadius: "24px",
  contentPadding: {
    top: "42px",
    topWithWidget: "58px",
    bottom: "16px",
    left: "10px",
    right: "84px",
  },
};

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

function createSceneStyle(
  background: string,
  fontSize: number,
  fontWeight: number,
): CSSProperties {
  return {
    background,
    fontSize: `${fontSize}em`,
    fontWeight,
  };
}

function getContentPaddingStyle(
  config: PreviewConfig,
  showWidgetPosition: boolean,
): CSSProperties {
  return {
    boxSizing: "border-box",
    paddingTop: showWidgetPosition
      ? config.contentPadding.topWithWidget
      : config.contentPadding.top,
    paddingBottom: config.contentPadding.bottom,
    paddingLeft: config.contentPadding.left ?? "0px",
    paddingRight: config.contentPadding.right ?? "0px",
  };
}

function DeviceChrome({
  isPortrait,
  lockDate,
  lockTime,
  showWidgetPosition,
  lockscreenTextColor,
  lockscreenTitleColor,
  widgetTextColor,
  widgetBorderColor,
}: {
  isPortrait: boolean;
  lockDate: string;
  lockTime: string;
  showWidgetPosition: boolean;
  lockscreenTextColor: string;
  lockscreenTitleColor: string;
  widgetTextColor: string;
  widgetBorderColor: string;
}) {
  if (isPortrait) {
    return (
      <>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-6 pt-7">
          <div
            className="flex items-center justify-between text-[10px] font-medium tracking-[0.02em]"
            style={{ color: lockscreenTextColor }}>
            <span>Fido</span>
            <div className="flex items-center gap-1.5 opacity-90">
              <Signal className="h-3 w-3" strokeWidth={2.2} />
              <Wifi className="h-3 w-3" strokeWidth={2.2} />
              <BatteryFull className="h-3.5 w-3.5" strokeWidth={2.2} />
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

        {showWidgetPosition ? (
          <div className="pointer-events-none absolute inset-x-0 top-48 z-20 flex justify-center">
            <div
              className="flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.10)] backdrop-blur-sm"
              style={{
                color: widgetTextColor,
                background: "rgba(255,255,255,0.42)",
                borderColor: widgetBorderColor,
              }}>
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
      </>
    );
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-2">
        <p
          className="text-[9px] font-medium opacity-90"
          style={{ color: lockscreenTitleColor }}>
          {lockDate}
        </p>
        <p
          className="text-[28px] font-semibold leading-none tracking-[-0.05em]"
          style={{ color: lockscreenTextColor }}>
          {lockTime}
        </p>
      </div>

      {showWidgetPosition ? (
        <div className="pointer-events-none absolute inset-x-0 top-8.5 z-20 flex justify-center">
          <div
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-sm"
            style={{
              color: widgetTextColor,
              background: "rgba(255,255,255,0.42)",
              borderColor: widgetBorderColor,
            }}>
            <CalendarDays className="h-3 w-3" strokeWidth={2.1} />
            <span className="text-[9px] font-semibold">Widget</span>
          </div>
        </div>
      ) : null}
    </>
  );
}

function PreviewDevice({
  config,
  sceneStyle,
  contentPaddingStyle,
  content,
  overlay,
}: {
  config: PreviewConfig;
  sceneStyle: CSSProperties;
  contentPaddingStyle: CSSProperties;
  content: ReactNode;
  overlay: ReactNode;
}) {
  const clipPath = `inset(0 round ${config.screenRadius})`;

  return (
    <div className={cn("relative mx-auto w-full", config.maxWidthClassName)}>
      <Image
        src={config.imageSrc}
        alt={config.imageAlt}
        className="pointer-events-none relative z-10 w-full"
        width={config.imageWidth}
        height={config.imageHeight}
      />
      <div
        className="absolute"
        style={{
          ...config.screenInset,
          overflow: "hidden",
          borderRadius: config.screenRadius,
          clipPath,
        }}>
        <div
          className="relative h-full w-full overflow-hidden wallpaper-preview-shell"
          style={{
            ...sceneStyle,
            borderRadius: config.screenRadius,
            clipPath,
          }}>
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              ...sceneStyle,
              borderRadius: config.screenRadius,
              clipPath,
            }}>
            <div
              className="wallpaper-preview-shell h-full w-full overflow-hidden"
              style={contentPaddingStyle}>
              {content}
            </div>
          </div>
          {overlay}
        </div>
      </div>
    </div>
  );
}

export function PreviewPanel() {
  const { settings, entries, colorOverrides, updateSettings } = useWallpaper();
  const theme = getThemePreset(settings.themeId, settings.customBackground);
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const now = new Date();
  const lockDate = formatLockscreenDate(now);
  const lockTime = formatLockscreenTime(now);
  const isPortrait = settings.orientation === "portrait";
  const previewConfig = isPortrait
    ? PORTRAIT_PREVIEW_CONFIG
    : LANDSCAPE_PREVIEW_CONFIG;
  const exportSize = isPortrait
    ? PORTRAIT_EXPORT_SIZE
    : LANDSCAPE_EXPORT_SIZE;
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
    widgetTextColor.toUpperCase() === "#0F172A"
      ? "rgba(15,23,42,0.14)"
      : "rgba(255,255,255,0.24)";
  const sceneStyle = createSceneStyle(
    theme.background,
    settings.fontSize,
    fontWeightMap[settings.fontWeight],
  );
  const contentPaddingStyle = getContentPaddingStyle(
    previewConfig,
    settings.showWidgetPosition,
  );

  async function handleExport() {
    if (!exportRef.current || isExporting) {
      return;
    }

    setExportError("");
    setIsExporting(true);

    try {
      const blob = await toBlob(exportRef.current, {
        pixelRatio: 3,
        quality: settings.exportQuality,
        cacheBust: true,
        skipFonts: true,
        type: settings.exportFormat === "jpeg" ? "image/jpeg" : "image/png",
      });

      if (!blob) {
        throw new Error("Failed to render wallpaper image.");
      }

      const filenameBase = `uitm-class-canvas-${settings.layoutStyle}-${settings.orientation}`;
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

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Preview</h3>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => updateSettings({ orientation: "portrait" })}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              isPortrait
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}>
            Portrait
          </button>
          <button
            type="button"
            onClick={() => updateSettings({ orientation: "landscape" })}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              !isPortrait
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}>
            Landscape
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-muted/30 p-4 sm:p-6">
        <div className="flex h-full items-center justify-center">
          <div className="relative">
            <PreviewDevice
              config={previewConfig}
              sceneStyle={sceneStyle}
              contentPaddingStyle={contentPaddingStyle}
              content={
                <WallpaperTable
                  entries={entries}
                  colorOverrides={colorOverrides}
                  renderMode="preview"
                />
              }
              overlay={
                <DeviceChrome
                  isPortrait={isPortrait}
                  lockDate={lockDate}
                  lockTime={lockTime}
                  showWidgetPosition={settings.showWidgetPosition}
                  lockscreenTextColor={lockscreenTextColor}
                  lockscreenTitleColor={lockscreenTitleColor}
                  widgetTextColor={widgetTextColor}
                  widgetBorderColor={widgetBorderColor}
                />
              }
            />

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
        className="pointer-events-none fixed top-0 -left-[9999px] opacity-0">
        <div
          ref={exportRef}
          className="relative overflow-hidden"
          style={{
            width: exportSize.width,
            height: exportSize.height,
            ...sceneStyle,
          }}>
          <div className="h-full w-full overflow-hidden" style={contentPaddingStyle}>
            <WallpaperTable
              entries={entries}
              colorOverrides={colorOverrides}
              renderMode="export"
            />
          </div>
        </div>
      </div>

      {exportError ? (
        <div className="border-t border-border px-4 py-3 text-sm text-red-600 sm:px-5">
          {exportError}
        </div>
      ) : null}

      <div className="relative z-30 border-t border-border bg-background px-4 py-4 sm:px-5">
        <Button
          className="relative z-30 w-full rounded-full border-0 bg-[#21d4cf] font-semibold text-slate-950 shadow-[0_12px_24px_rgba(33,212,207,0.24)] hover:bg-[#3fe1dc]"
          size="lg"
          onClick={handleExport}
          disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
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
