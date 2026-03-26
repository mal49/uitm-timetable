"use client";

import { useMemo, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import { CalendarX2, Download, Palette, Smartphone, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { TimetableGrid } from "@/components/timetable-grid";
import { TimetableTable } from "@/components/timetable-table";
import { WallpaperCanvas } from "@/components/wallpaper/wallpaper-canvas";
import { WallpaperTimetableMatrix } from "@/components/wallpaper/wallpaper-timetable-matrix";
import type { TimetableEntry } from "@/lib/types";
import {
  WALLPAPER_BACKGROUNDS,
  WALLPAPER_DEVICES,
  getOrientedDevicePreset,
  type WallpaperDeviceId,
  type WallpaperBackgroundId,
  type WallpaperOrientation,
} from "@/lib/wallpaper-presets";

type WallpaperOverlayMode = "matrix" | "grid" | "table";
type WallpaperImageFormat = "png" | "jpg";

export interface WallpaperDesignerProps {
  entries: TimetableEntry[];
  colorOverrides: Record<string, string>;
  /** Usually "MY" in this app. */
  courseLabel: string;
}

function formatDateForWallpaper(d: Date) {
  // Keep it short for lockscreen readability.
  return d.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });
}

function formatTimeForWallpaper(d: Date) {
  // Lockscreen-style (no seconds).
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function WallpaperDesigner({
  entries,
  colorOverrides,
  courseLabel,
}: WallpaperDesignerProps) {
  const today = useMemo(() => new Date(), []);

  const [deviceId, setDeviceId] = useState<WallpaperDeviceId>("iphone14pro");
  const [orientation, setOrientation] = useState<WallpaperOrientation>("portrait");
  const [backgroundId, setBackgroundId] = useState<WallpaperBackgroundId>("gradientAurora");
  const [overlayMode, setOverlayMode] = useState<WallpaperOverlayMode>("matrix");
  const [imageFormat, setImageFormat] = useState<WallpaperImageFormat>("png");

  // Typography + density toggles.
  const [title, setTitle] = useState<string>("UiTM Timetable");
  const [showDate, setShowDate] = useState<boolean>(false);
  const [showLockTime, setShowLockTime] = useState<boolean>(true);
  const [showTime, setShowTime] = useState<boolean>(true);
  const [showVenue, setShowVenue] = useState<boolean>(false);
  const [showLecturer, setShowLecturer] = useState<boolean>(false);
  const [showIcons, setShowIcons] = useState<boolean>(false);

  const [compact, setCompact] = useState<boolean>(true);

  const resolvedDevice = WALLPAPER_DEVICES.find((d) => d.id === deviceId) ?? WALLPAPER_DEVICES[0]!;
  const resolvedBackground = WALLPAPER_BACKGROUNDS.find((b) => b.id === backgroundId) ?? WALLPAPER_BACKGROUNDS[0]!;
  const orientedDevice = getOrientedDevicePreset(resolvedDevice, orientation);

  const exportRef = useRef<HTMLDivElement | null>(null);

  const [exportError, setExportError] = useState<string>("");
  const [exporting, setExporting] = useState<boolean>(false);

  const previewMaxWidth = 520;
  const previewScale = Math.min(1, previewMaxWidth / orientedDevice.widthPx);
  const previewHeight = Math.round(orientedDevice.heightPx * previewScale);

  const dateText = formatDateForWallpaper(today);
  const timeText = formatTimeForWallpaper(today);

  // Compact defaults (toggled by user).
  const computedShowVenue = compact ? false : showVenue;
  const computedShowLecturer = compact ? false : showLecturer;
  const computedShowIcons = compact ? false : showIcons;

  const overlay = (
    <>
      {overlayMode === "matrix" ? (
        <WallpaperTimetableMatrix
          entries={entries}
          course={courseLabel}
          colorOverrides={colorOverrides}
          showTime={showTime}
          showVenue={computedShowVenue}
          showLecturer={computedShowLecturer}
        />
      ) : overlayMode === "grid" ? (
        <TimetableGrid
          variant="wallpaper"
          layoutDesktop
          entries={entries}
          course={courseLabel}
          colorOverrides={colorOverrides}
          showTime={showTime}
          showVenue={computedShowVenue}
          showLecturer={computedShowLecturer}
          showIcons={computedShowIcons}
        />
      ) : (
        <TimetableTable
          variant="wallpaper"
          entries={entries}
          course={courseLabel}
          colorOverrides={colorOverrides}
          showTime={showTime}
          showVenue={computedShowVenue}
          showLecturer={computedShowLecturer}
          showIcons={computedShowIcons}
        />
      )}
    </>
  );

  async function exportWallpaper() {
    setExportError("");

    if (!exportRef.current) {
      setExportError("Nothing to export yet.");
      return;
    }

    try {
      setExporting(true);

      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      const baseName = `uitm-timetable-wallpaper-${deviceId}-${orientation}-${backgroundId}-${stamp}`;
      const fileExt = imageFormat === "png" ? "png" : "jpg";

      // JPG dislikes transparency; PNG is fine but both benefit from a solid background.
      const backgroundColor = "#000000";

      // Wait a frame so fonts/layout settle.
      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      const blob = await toBlob(exportRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        backgroundColor,
        // Avoid html-to-image font embedding crashes when a font is missing/undefined.
        skipFonts: true,
        type: imageFormat === "png" ? "image/png" : "image/jpeg",
        quality: imageFormat === "jpg" ? 0.95 : undefined,
      });

      if (!blob) throw new Error("Failed to render wallpaper image.");

      const url = URL.createObjectURL(blob);
      try {
        const link = document.createElement("a");
        link.download = `${baseName}.${fileExt}`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } finally {
        window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setExportError(msg || "Failed to export wallpaper.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="rounded-lg sm:rounded-2xl border border-border bg-card p-4 sm:p-5 md:p-6 shadow-sm space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Designer</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Generate an iPhone/iPad lockscreen wallpaper from your timetable.</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={exportWallpaper}
          disabled={exporting || entries.length === 0}
          className="gap-2 w-full sm:w-auto h-9"
        >
          {exporting ? null : <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          {exporting ? "Preparing…" : "Download wallpaper"}
        </Button>
      </div>

      {exportError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 flex items-start gap-3">
          <div className="mt-0.5">
            <CalendarX2 className="h-4 w-4 text-destructive" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-destructive">Export failed</p>
            <p className="text-xs text-muted-foreground">{exportError}</p>
          </div>
        </div>
      ) : null}

      {entries.length === 0 ? (
        <div className="rounded-lg sm:rounded-xl border border-border bg-muted/30 px-4 sm:px-5 py-8 sm:py-12 flex flex-col items-center gap-2 sm:gap-3 text-center">
          <CalendarX2 className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/40" />
          <p className="font-semibold text-foreground text-sm sm:text-base">Select groups to generate a timetable first</p>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
            Your wallpaper overlay uses your current timetable sessions.
          </p>
        </div>
      ) : (
        <div className="rounded-lg sm:rounded-2xl border border-border bg-muted/20 p-3 sm:p-4 md:p-5">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-4 sm:gap-5 lg:gap-6 items-start">
            {/* Studio preview (left) */}
            <div className="rounded-lg sm:rounded-2xl border border-border bg-background/40 p-3 sm:p-4 md:p-5">
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <p className="text-xs sm:text-sm font-semibold">Preview</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCompact((v) => !v)}
                  className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-full border transition-colors ${
                    compact
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  {compact ? "Compact ON" : "Compact OFF"}
                </button>
              </div>

              <div className="mt-3 sm:mt-4 flex items-center justify-center">
                <div className="relative">
                  {/* iPhone mockup frame */}
                  <div className="relative" style={{ width: previewMaxWidth }}>
                    {/* Phone frame image */}
                    <img
                      src="/misc/apple-iphone-15-black-portrait.png"
                      alt="iPhone 15 Frame"
                      className="relative z-10 pointer-events-none"
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                      }}
                    />
                    
                    {/* Wallpaper content inside the frame */}
                    <div
                      className="absolute"
                      style={{
                        top: "2.5%",
                        left: "3.8%",
                        right: "3.8%",
                        bottom: "2.5%",
                        overflow: "hidden",
                        borderRadius: orientedDevice.frameRadiusPx * (previewMaxWidth / orientedDevice.widthPx),
                      }}
                    >
                      <div
                        style={{
                          transform: `scale(${previewScale})`,
                          transformOrigin: "top left",
                          width: orientedDevice.widthPx,
                          height: orientedDevice.heightPx,
                        }}
                      >
                        <WallpaperCanvas
                          device={orientedDevice}
                          background={resolvedBackground}
                          orientation={orientation}
                          title={title.trim() ? title.trim() : "UiTM Timetable"}
                          showTitle
                          showDate={showDate}
                          dateText={dateText}
                          showTime={showLockTime}
                          timeText={timeText}
                          overlay={overlay}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Small "carousel" dots like the reference UI */}
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-foreground/25" />
                    <span className="h-2 w-2 rounded-full bg-foreground/60" />
                    <span className="h-2 w-2 rounded-full bg-foreground/25" />
                  </div>
                </div>
              </div>
            </div>

            {/* Controls (right) */}
            <div className="space-y-3">
              <details open className="group rounded-2xl border border-border bg-background/40">
                <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Pick a display</span>
                  </div>
                  <span className="text-xs text-muted-foreground group-open:hidden">Open</span>
                  <span className="text-xs text-muted-foreground hidden group-open:inline">Close</span>
                </summary>
                <div className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Device</label>
                      <select
                        value={deviceId}
                        onChange={(e) => setDeviceId(e.target.value as WallpaperDeviceId)}
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      >
                        {WALLPAPER_DEVICES.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Orientation</label>
                      <select
                        value={orientation}
                        onChange={(e) => setOrientation(e.target.value as WallpaperOrientation)}
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      >
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>
                  </div>
                </div>
              </details>

              <details className="group rounded-2xl border border-border bg-background/40">
                <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Select a theme</span>
                  </div>
                  <span className="text-xs text-muted-foreground group-open:hidden">Open</span>
                  <span className="text-xs text-muted-foreground hidden group-open:inline">Close</span>
                </summary>
                <div className="px-4 pb-4 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Background</label>
                    <select
                      value={backgroundId}
                      onChange={(e) => setBackgroundId(e.target.value as WallpaperBackgroundId)}
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    >
                      {WALLPAPER_BACKGROUNDS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </details>

              <details open className="group rounded-2xl border border-border bg-background/40">
                <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Styling</span>
                  </div>
                  <span className="text-xs text-muted-foreground group-open:hidden">Open</span>
                  <span className="text-xs text-muted-foreground hidden group-open:inline">Close</span>
                </summary>
                <div className="px-4 pb-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Overlay mode</label>
                      <select
                        value={overlayMode}
                        onChange={(e) => setOverlayMode(e.target.value as WallpaperOverlayMode)}
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      >
                        <option value="matrix">Matrix</option>
                        <option value="grid">Cards</option>
                        <option value="table">Table</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Image format</label>
                      <select
                        value={imageFormat}
                        onChange={(e) => setImageFormat(e.target.value as WallpaperImageFormat)}
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      >
                        <option value="png">PNG</option>
                        <option value="jpg">JPG</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Header title</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="max-w-full" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2">
                      <span className="text-sm font-semibold">Show date</span>
                      <input
                        type="checkbox"
                        checked={showDate}
                        onChange={(e) => setShowDate(e.target.checked)}
                        className="h-4 w-4 accent-primary"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2">
                      <span className="text-sm font-semibold">Show time</span>
                      <input
                        type="checkbox"
                        checked={showLockTime}
                        onChange={(e) => setShowLockTime(e.target.checked)}
                        className="h-4 w-4 accent-primary"
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Overlay details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2">
                        <span className="text-sm font-semibold">Show time</span>
                        <input
                          type="checkbox"
                          checked={showTime}
                          onChange={(e) => setShowTime(e.target.checked)}
                          className="h-4 w-4 accent-primary"
                        />
                      </label>
                      <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2">
                        <span className="text-sm font-semibold">Show venue</span>
                        <input
                          type="checkbox"
                          checked={computedShowVenue}
                          onChange={(e) => setShowVenue(e.target.checked)}
                          disabled={compact}
                          className="h-4 w-4 accent-primary disabled:opacity-50"
                        />
                      </label>
                      <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2">
                        <span className="text-sm font-semibold">Show lecturer</span>
                        <input
                          type="checkbox"
                          checked={computedShowLecturer}
                          onChange={(e) => setShowLecturer(e.target.checked)}
                          disabled={compact}
                          className="h-4 w-4 accent-primary disabled:opacity-50"
                        />
                      </label>
                      <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2">
                        <span className="text-sm font-semibold">Show icons</span>
                        <input
                          type="checkbox"
                          checked={computedShowIcons}
                          onChange={(e) => setShowIcons(e.target.checked)}
                          disabled={compact}
                          className="h-4 w-4 accent-primary disabled:opacity-50"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </details>

              {/* Hidden export node */}
              <div aria-hidden="true" className="fixed left-[-10000px] top-0 pointer-events-none opacity-0">
                <div ref={exportRef}>
                  <WallpaperCanvas
                    device={orientedDevice}
                    background={resolvedBackground}
                    orientation={orientation}
                    title={title.trim() ? title.trim() : "UiTM Timetable"}
                    showTitle
                    showDate={showDate}
                    dateText={dateText}
                    showTime={showLockTime}
                    timeText={timeText}
                    overlay={
                      overlayMode === "matrix" ? (
                        <WallpaperTimetableMatrix
                          entries={entries}
                          course={courseLabel}
                          colorOverrides={colorOverrides}
                          showTime={showTime}
                          showVenue={computedShowVenue}
                          showLecturer={computedShowLecturer}
                        />
                      ) : overlayMode === "grid" ? (
                        <TimetableGrid
                          variant="wallpaper"
                          layoutDesktop
                          entries={entries}
                          course={courseLabel}
                          colorOverrides={colorOverrides}
                          showTime={showTime}
                          showVenue={computedShowVenue}
                          showLecturer={computedShowLecturer}
                          showIcons={computedShowIcons}
                        />
                      ) : (
                        <TimetableTable
                          variant="wallpaper"
                          entries={entries}
                          course={courseLabel}
                          colorOverrides={colorOverrides}
                          showTime={showTime}
                          showVenue={computedShowVenue}
                          showLecturer={computedShowLecturer}
                          showIcons={computedShowIcons}
                        />
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

