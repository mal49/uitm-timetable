"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { toBlob } from "html-to-image";
import Image from "next/image";
import {
  Apple,
  BatteryFull,
  Bolt,
  CalendarDays,
  Camera,
  Check,
  Info,
  RotateCcw,
  Signal,
  Smartphone,
  Wifi,
  X,
} from "lucide-react";
import { Segmented } from "@/components/ui/segmented";
import { useWallpaper } from "./wallpaper-context";
import { EXPORT_DEVICE } from "./device-presets";
import { WallpaperTable } from "./layouts/wallpaper-table";
import { TABLE_OFFSET_LIMIT, WallpaperCanvas, getCanvasLockColor, getTableOffset, usesWallpaperCanvas } from "./layouts/wallpaper-styles";
import { buildWeek } from "./layouts/week-model";
import { getThemePreset } from "./themes/theme-presets";

type PreviewConfig = {
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  designWidth: number;
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
  };
};

const PREVIEW_CONFIG: PreviewConfig = {
  imageSrc: "/misc/apple-iphone-15-black-portrait.png",
  imageAlt: "iPhone Frame",
  imageWidth: 392,
  imageHeight: 849,
  designWidth: 500,
  screenInset: {
    top: "3.2%",
    left: "5.1%",
    right: "5.1%",
    bottom: "3.2%",
  },
  screenRadius: "53px",
  contentPadding: {
    top: "253px",
    topWithWidget: "304px",
    bottom: "117px",
  },
};

/** Renders the wallpaper canvas at the measured size of the preview screen. */
function MeasuredCanvas({ week, settings }: Pick<ComponentProps<typeof WallpaperCanvas>, "week" | "settings">) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setSize({ width: node.clientWidth, height: node.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-full w-full">
      {size ? <WallpaperCanvas {...size} week={week} settings={settings} /> : null}
    </div>
  );
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
  };
}

function getExportContentPaddingStyle(showWidgetPosition: boolean): CSSProperties {
  return {
    boxSizing: "border-box",
    paddingTop: showWidgetPosition ? EXPORT_DEVICE.paddingTopWithWidget : EXPORT_DEVICE.paddingTop,
    paddingBottom: EXPORT_DEVICE.paddingBottom,
  };
}

function DeviceChrome({
  lockDate,
  lockTime,
  showWidgetPosition,
  lockscreenTextColor,
  lockscreenTitleColor,
  widgetTextColor,
  widgetBorderColor,
}: {
  lockDate: string;
  lockTime: string;
  showWidgetPosition: boolean;
  lockscreenTextColor: string;
  lockscreenTitleColor: string;
  widgetTextColor: string;
  widgetBorderColor: string;
}) {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-[31px] pt-[36px]">
        <div
          className="flex items-center justify-between text-[13px] font-medium tracking-[0.02em]"
          style={{ color: lockscreenTextColor }}>
          <span>Fido</span>
          <div className="flex items-center gap-[8px] opacity-90">
            <Signal className="h-[15px] w-[15px]" strokeWidth={2.2} />
            <Wifi className="h-[15px] w-[15px]" strokeWidth={2.2} />
            <BatteryFull className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[125px] z-20 text-center">
        <p
          className="text-[17px] font-medium tracking-[0.01em] opacity-90"
          style={{ color: lockscreenTitleColor }}>
          {lockDate}
        </p>
        <p
          className="mt-[5px] text-[77px] font-semibold leading-none tracking-[-0.06em]"
          style={{ color: lockscreenTextColor }}>
          {lockTime}
        </p>
      </div>

      {showWidgetPosition ? (
        <div className="pointer-events-none absolute inset-x-0 top-[245px] z-20 flex justify-center">
          <div
            className="flex items-center gap-[10px] rounded-full border px-[15px] py-[8px] shadow-[0_8px_20px_rgba(0,0,0,0.10)] backdrop-blur-sm"
            style={{
              color: widgetTextColor,
              background: "rgba(255,255,255,0.42)",
              borderColor: widgetBorderColor,
            }}>
            <CalendarDays className="h-[18px] w-[18px]" strokeWidth={2.1} />
            <span className="text-[14px] font-semibold tracking-[0.01em]">
              Widget Position
            </span>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-[46px] z-20 flex items-center justify-between px-[36px]">
        <div className="flex h-[51px] w-[51px] items-center justify-center rounded-full bg-black/22 text-white shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-sm">
          <Bolt className="h-[20px] w-[20px]" strokeWidth={2.2} />
        </div>
        <div className="flex h-[51px] w-[51px] items-center justify-center rounded-full bg-black/22 text-white shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-sm">
          <Camera className="h-[20px] w-[20px]" strokeWidth={2.2} />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[15px] z-20 flex justify-center">
        <div className="h-[7px] w-[143px] rounded-full bg-white/85" />
      </div>
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
  const designHeight =
    (config.designWidth * config.imageHeight) / config.imageWidth;

  const innerDevice = (
    <div className="relative w-full">
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

  return (
    <ScaledDevice
      designWidth={config.designWidth}
      designHeight={designHeight}>
      {innerDevice}
    </ScaledDevice>
  );
}

const MOBILE_BREAKPOINT_PX = 1024;
const MOBILE_VIEWPORT_FILL = 0.78;

function computeScale(
  parentWidth: number,
  viewportWidth: number,
  viewportHeight: number,
  designWidth: number,
  designHeight: number,
): number {
  const widthScale = parentWidth / designWidth;
  const isMobile = viewportWidth < MOBILE_BREAKPOINT_PX;
  if (!isMobile) {
    return Math.min(1, widthScale);
  }
  const heightScale = (viewportHeight * MOBILE_VIEWPORT_FILL) / designHeight;
  return Math.min(1, widthScale, heightScale);
}

function ScaledDevice({
  designWidth,
  designHeight,
  children,
}: {
  designWidth: number;
  designHeight: number;
  children: ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const parent = wrapperRef.current?.parentElement;
    if (!parent) return;

    const update = () => {
      const next = computeScale(
        parent.clientWidth,
        window.innerWidth,
        window.innerHeight,
        designWidth,
        designHeight,
      );
      if (Number.isFinite(next) && next > 0) {
        setScale(next);
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(parent);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [designWidth, designHeight]);

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto"
      style={{
        width: `${designWidth * scale}px`,
        height: `${designHeight * scale}px`,
      }}>
      <div
        className="absolute top-0 left-0"
        style={{
          width: `${designWidth}px`,
          height: `${designHeight}px`,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
        }}>
        {children}
      </div>
    </div>
  );
}

export function PreviewPanel() {
  const { settings, updateSettings, entries, colorOverrides } = useWallpaper();
  const week = useMemo(() => buildWeek(entries, colorOverrides), [entries, colorOverrides]);
  const isPhotoMode = settings.backgroundMode === "photo";
  // Styles, photos and non-grid table styles draw the whole wallpaper; a photo-less Photo tab previews the Night theme.
  const useCanvas = usesWallpaperCanvas(settings);
  const theme = isPhotoMode && !settings.photo
    ? getThemePreset("night")
    : getThemePreset(settings.themeId, settings.customBackground);
  const drag = useRef<{ kind: "table" | "photo"; y: number; start: number; screen: number } | null>(null);
  const canDragPhoto = isPhotoMode && Boolean(settings.photo);
  const canMoveTable = !(canDragPhoto && settings.photoTreatment === "split");
  const tableShift: CSSProperties = { transform: `translateY(${getTableOffset(settings)}%)` };
  const exportMetrics = EXPORT_DEVICE;
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [saved, setSaved] = useState<{ filename: string; size: number } | null>(null);
  const now = new Date();
  const lockDate = formatLockscreenDate(now);
  const lockTime = formatLockscreenTime(now);
  const previewConfig = PREVIEW_CONFIG;
  const fontWeightMap: Record<typeof settings.fontWeight, number> = {
    light: 300,
    regular: 400,
    medium: 500,
    bold: 700,
  };
  const lockscreenTextColor = useCanvas ? getCanvasLockColor(settings) : theme.lockscreenTextColor ?? "#ffffff";
  const lockscreenTitleColor = useCanvas
    ? lockscreenTextColor
    : theme.lockscreenTitleColor ?? lockscreenTextColor;
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
  const exportContentPaddingStyle = getExportContentPaddingStyle(settings.showWidgetPosition);

  async function handleExport() {
    if (!exportRef.current || isExporting) {
      return;
    }

    setExportError("");
    setIsExporting(true);

    try {
      const blob = await toBlob(exportRef.current, {
        pixelRatio: exportMetrics.pixelRatio,
        quality: settings.exportQuality,
        cacheBust: true,
        type: settings.exportFormat === "jpeg" ? "image/jpeg" : "image/png",
        // The styles use serif web fonts, so embed them; the tuned week grid keeps its original path.
        skipFonts: !useCanvas,
      });

      if (!blob) {
        throw new Error("Failed to render wallpaper image.");
      }

      const filename = `uitm-schedule-${EXPORT_DEVICE.id}.${settings.exportFormat}`;
      const dataUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(dataUrl), 1500);
      setSaved({ filename, size: blob.size });
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
      {/* Triggered by the "Export wallpaper" button in the app's summary bar. */}
      <form
        id="wallpaper-export"
        hidden
        onSubmit={(event) => {
          event.preventDefault();
          void handleExport();
        }}
      />

      <div className="min-h-0 flex-1 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_65%)] p-4 sm:p-8">
        <div className="flex h-full flex-col items-center justify-center gap-5">
          {isPhotoMode && !settings.photo ? (
            <p className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
              <Info aria-hidden="true" className="size-3.5" />
              No photo yet — previewing the Night theme
            </p>
          ) : null}
          <div
            className="relative w-full max-w-[340px] cursor-grab touch-none select-none active:cursor-grabbing"
            title={canDragPhoto ? "Drag the timetable to move it, or the photo to reposition it" : "Drag the timetable to move it"}
            onPointerDown={(event) => {
              const target = event.target as HTMLElement;
              const screen = event.currentTarget.querySelector(".wallpaper-preview-shell");
              const inScreen = Boolean(target.closest(".wallpaper-preview-shell"));
              // Canvas content sits inside [data-surface] containers; the containers themselves are empty space.
              const onTable = inScreen && !target.hasAttribute("data-surface") && Boolean(target.parentElement?.closest("[data-surface]"));
              const kind = canDragPhoto && !(onTable && canMoveTable) ? "photo" : inScreen && canMoveTable ? "table" : null;
              if (!kind || !screen) return;
              drag.current = {
                kind,
                y: event.clientY,
                start: kind === "table" ? settings.tableOffset : settings.photoPositionY,
                screen: screen.getBoundingClientRect().height,
              };
              event.preventDefault(); // no text selection or native image drag while moving
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const current = drag.current;
              if (!current) return;
              const delta = ((event.clientY - current.y) / current.screen) * 100;
              updateSettings(
                current.kind === "table"
                  ? { tableOffset: Math.round(Math.min(TABLE_OFFSET_LIMIT, Math.max(-TABLE_OFFSET_LIMIT, current.start + delta))) }
                  : { photoPositionY: Math.min(100, Math.max(0, current.start - delta * 1.5)) },
              );
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
          >
            <PreviewDevice
              config={previewConfig}
              sceneStyle={sceneStyle}
              contentPaddingStyle={useCanvas ? {} : { ...contentPaddingStyle, ...tableShift }}
              content={
                useCanvas ? (
                  <MeasuredCanvas week={week} settings={settings} />
                ) : (
                  <WallpaperTable
                    entries={entries}
                    colorOverrides={colorOverrides}
                    renderMode="preview"
                  />
                )
              }
              overlay={
                <DeviceChrome
                  lockDate={lockDate}
                  lockTime={lockTime}
                  showWidgetPosition={settings.showWidgetPosition && !useCanvas}
                  lockscreenTextColor={lockscreenTextColor}
                  lockscreenTitleColor={lockscreenTitleColor}
                  widgetTextColor={widgetTextColor}
                  widgetBorderColor={widgetBorderColor}
                />
              }
            />

            <p className="mt-4 flex h-7 items-center justify-center gap-2 text-xs text-muted-foreground">
              {isExporting ? (
                <span aria-live="polite">Exporting…</span>
              ) : settings.tableOffset !== 0 && canMoveTable ? (
                <button
                  type="button"
                  onClick={() => updateSettings({ tableOffset: 0 })}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-medium text-foreground hover:bg-surface-3"
                >
                  <RotateCcw aria-hidden="true" className="size-3.5" />
                  Reset table position
                </button>
              ) : canMoveTable ? (
                "Drag the timetable to move it"
              ) : null}
            </p>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 -left-2499.75 opacity-0">
        <div
          ref={exportRef}
          className="relative overflow-hidden"
          style={{
            width: exportMetrics.width,
            height: exportMetrics.height,
            ...sceneStyle,
          }}>
          {useCanvas ? (
            <WallpaperCanvas width={exportMetrics.width} height={exportMetrics.height} week={week} settings={settings} />
          ) : (
            <div
              className="h-full w-full overflow-hidden"
              style={{ ...exportContentPaddingStyle, ...tableShift }}>
              <WallpaperTable
                entries={entries}
                colorOverrides={colorOverrides}
                renderMode="export"
              />
            </div>
          )}
        </div>
      </div>

      {exportError ? (
        <p role="alert" className="px-6 pb-4 text-center text-sm text-destructive">{exportError}</p>
      ) : null}

      {saved ? <SavedDialog saved={saved} onClose={() => setSaved(null)} /> : null}

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

const SET_WALLPAPER_STEPS = {
  iphone: [
    "Open Photos and find the image.",
    "Tap Share → Use as Wallpaper.",
    "Pinch to fit, then Add → Set as Lock Screen.",
  ],
  android: [
    "Open Gallery or Photos and find the image.",
    "Tap ⋮ → Set as wallpaper.",
    "Choose Lock screen, then tap Done.",
  ],
};

function SavedDialog({
  saved,
  onClose,
}: {
  saved: { filename: string; size: number };
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [platform, setPlatform] = useState<"iphone" | "android">("iphone");

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="saved-title"
      className="m-auto w-[min(460px,calc(100vw-32px))] rounded-[20px] border border-border bg-card p-6 text-foreground shadow-[0_24px_60px_#00000080] backdrop:bg-black/60 backdrop:backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success/20 text-success">
          <Check aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="saved-title" className="text-lg font-semibold">Saved to your downloads</h2>
          <p className="truncate text-[13px] text-muted-foreground">
            {saved.filename} · {(saved.size / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close"
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
      <Segmented
        label="Phone type"
        value={platform}
        onChange={setPlatform}
        options={[
          { value: "iphone", label: <><Apple aria-hidden="true" />iPhone</> },
          { value: "android", label: <><Smartphone aria-hidden="true" />Android</> },
        ]}
        className="mt-5"
      />
      <ol className="mt-5 space-y-3">
        {SET_WALLPAPER_STEPS[platform].map((text, index) => (
          <li key={text} className="flex items-center gap-3 text-sm">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary-soft text-xs font-semibold text-primary-soft-foreground">
              {index + 1}
            </span>
            {text}
          </li>
        ))}
      </ol>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="h-10 rounded-xl bg-muted px-4 text-sm font-medium hover:bg-surface-3">
          Try another theme
        </button>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="h-10 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
          Done
        </button>
      </div>
    </dialog>
  );
}
