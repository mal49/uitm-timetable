"use client";

import { useMemo, useRef, useState } from "react";
import {
  Columns3,
  Droplets,
  Grid3x3,
  Grip,
  ImagePlus,
  Landmark,
  LayoutGrid,
  List,
  PanelBottom,
  PanelTop,
  Replace,
  Rows3,
  SquareDashed,
  Trash2,
  Upload,
} from "lucide-react";
import { Segmented } from "@/components/ui/segmented";
import { cn } from "@/lib/utils";
import { EXPORT_DEVICE } from "./device-presets";
import { CANVAS_WIDTH, WALLPAPER_STYLES, WallpaperCanvas, getTableStyle } from "./layouts/wallpaper-styles";
import { buildWeek } from "./layouts/week-model";
import { useWallpaper, type PhotoTreatment, type TableStyle, type WallpaperPhoto } from "./wallpaper-context";

const THUMB_WIDTH = 112;
const THUMB_SCALE = THUMB_WIDTH / CANVAS_WIDTH;

export function StylePicker() {
  const { settings, updateSettings, entries, colorOverrides } = useWallpaper();
  const week = useMemo(() => buildWeek(entries, colorOverrides), [entries, colorOverrides]);

  return (
    <div className="grid grid-cols-3 gap-2">
      {WALLPAPER_STYLES.map((style) => {
        const active = settings.styleId === style.id;
        return (
          <button
            key={style.id}
            type="button"
            aria-pressed={active}
            onClick={() => updateSettings({ styleId: style.id })}
            className="group flex flex-col items-center gap-1.5 text-xs text-muted-foreground aria-pressed:font-medium aria-pressed:text-foreground"
          >
            {/* Live, cropped render of the style with the user's own week. */}
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none flex h-[84px] w-full justify-center overflow-hidden rounded-xl border-2",
                active ? "border-primary" : "border-border group-hover:border-surface-3",
              )}
              style={{ background: style.background }}
            >
              <span className="shrink-0" style={{ marginTop: -205 * THUMB_SCALE }}>
                <WallpaperCanvas
                  width={THUMB_WIDTH}
                  height={THUMB_WIDTH * (753 / 347)}
                  week={week}
                  settings={{ ...settings, backgroundMode: "style", styleId: style.id, showWidgetPosition: true, tableOffset: 0 }}
                />
              </span>
            </span>
            {style.name}
          </button>
        );
      })}
    </div>
  );
}

const TABLE_STYLES: { id: TableStyle; label: string; icon: typeof Grid3x3 }[] = [
  { id: "grid", label: "Week grid", icon: Grid3x3 },
  { id: "agenda", label: "Agenda", icon: List },
  { id: "cards", label: "Day cards", icon: Rows3 },
  { id: "timeline", label: "Time grid", icon: Columns3 },
  { id: "dots", label: "Dots", icon: Grip },
  { id: "bento", label: "Bento", icon: LayoutGrid },
  { id: "heritage", label: "Heritage", icon: Landmark },
];

/** Layout of the timetable over a Colour or Photo background. The week grid isn't offered on photos. */
export function TableStylePicker() {
  const { settings, updateSettings } = useWallpaper();
  const active = getTableStyle(settings);
  const options = settings.backgroundMode === "photo" ? TABLE_STYLES.filter((style) => style.id !== "grid") : TABLE_STYLES;

  return (
    <div className="space-y-2.5">
      <p className="pt-1 text-[11px] font-semibold tracking-[0.04em] text-faint uppercase">Table style</p>
      <div className="grid grid-cols-4 gap-2">
        {options.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={active === id}
            onClick={() => updateSettings({ tableStyle: id })}
            className="flex flex-col items-center gap-1 rounded-xl border border-transparent bg-muted px-1 py-2.5 text-xs font-semibold whitespace-nowrap text-muted-foreground hover:text-foreground aria-pressed:border-primary aria-pressed:bg-primary-soft aria-pressed:text-primary-soft-foreground"
          >
            <Icon aria-hidden="true" className="size-[18px]" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

const TREATMENTS: { id: PhotoTreatment; label: string; icon: typeof SquareDashed }[] = [
  { id: "glass", label: "Glass", icon: SquareDashed },
  { id: "scrim", label: "Scrim", icon: PanelBottom },
  { id: "tint", label: "Tint", icon: Droplets },
  { id: "split", label: "Split", icon: PanelTop },
];

/** Decodes the file, caps it at 2560px, and samples its brightness for the Auto text colour. */
async function loadPhoto(file: File): Promise<WallpaperPhoto> {
  const url = URL.createObjectURL(file);
  try {
    const image = document.createElement("img");
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 2560 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);

    const probe = document.createElement("canvas");
    probe.width = probe.height = 16;
    const probeContext = probe.getContext("2d")!;
    probeContext.drawImage(image, 0, 0, 16, 16);
    const pixels = probeContext.getImageData(0, 0, 16, 16).data;
    let luma = 0;
    for (let i = 0; i < pixels.length; i += 4) luma += pixels[i]! * 0.299 + pixels[i + 1]! * 0.587 + pixels[i + 2]! * 0.114;

    return { src: canvas.toDataURL("image/jpeg", 0.9), name: file.name, dark: luma / 256 < 150 };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex justify-between text-[13px]">
        {label}
        <span className="text-muted-foreground">{value}%</span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-4 w-full cursor-pointer accent-primary"
      />
    </label>
  );
}

export function PhotoPanel() {
  const { settings, updateSettings } = useWallpaper();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const { photo } = settings;

  function applyPhoto(next: WallpaperPhoto) {
    updateSettings({
      photo: next,
      photoPositionY: 50,
      recentPhotos: [next, ...settings.recentPhotos.filter((item) => item.src !== next.src)].slice(0, 3),
    });
  }

  async function handleFile(file?: File) {
    if (!file) return;
    setError("");
    try {
      applyPhoto(await loadPhoto(file));
    } catch {
      setError("Couldn't read that image. Try a JPG or PNG.");
    }
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      hidden
      onChange={(event) => {
        void handleFile(event.target.files?.[0]);
        event.target.value = "";
      }}
    />
  );

  if (!photo) {
    return (
      <div className="space-y-2.5">
        {input}
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void handleFile(event.dataTransfer.files[0]);
          }}
          className={cn(
            "flex flex-col items-center gap-2.5 rounded-2xl border border-primary px-4 py-[26px] text-center transition-colors",
            dragging ? "bg-primary/15" : "bg-primary/[0.06]",
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-[14px] bg-primary-soft text-primary-soft-foreground">
            <ImagePlus aria-hidden="true" className="size-[22px]" />
          </span>
          <p className="text-sm font-semibold">Drop a photo here</p>
          <p className="text-xs text-muted-foreground">
            JPG or PNG · we fit it to {EXPORT_DEVICE.width * EXPORT_DEVICE.pixelRatio} × {EXPORT_DEVICE.height * EXPORT_DEVICE.pixelRatio}
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Upload aria-hidden="true" className="size-4" />
            Choose photo
          </button>
        </div>
        {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
        {settings.recentPhotos.length ? (
          <>
            <p className="pt-1 text-[11px] font-semibold tracking-[0.04em] text-faint uppercase">Recent</p>
            <div className="grid grid-cols-3 gap-2">
              {settings.recentPhotos.map((item) => (
                <button
                  key={item.src}
                  type="button"
                  onClick={() => applyPhoto(item)}
                  aria-label={`Use ${item.name}`}
                  className="h-16 rounded-[10px] bg-cover bg-center ring-offset-2 ring-offset-card hover:ring-2 hover:ring-primary"
                  style={{ backgroundImage: `url(${item.src})` }}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    );
  }

  const showBlur = settings.photoTreatment === "glass" || settings.photoTreatment === "tint";

  return (
    <div className="space-y-2.5">
      {input}
      <div className="flex items-center gap-2.5 rounded-xl bg-muted p-2">
        <span aria-hidden="true" className="h-14 w-11 shrink-0 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${photo.src})` }} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold">{photo.name}</p>
          <p className="text-[11px] text-muted-foreground">Drag in preview to reposition</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Replace photo"
          className="flex size-8 items-center justify-center rounded-lg bg-surface-3 hover:opacity-80"
        >
          <Replace aria-hidden="true" className="size-[15px]" />
        </button>
        <button
          type="button"
          onClick={() => updateSettings({ photo: undefined })}
          aria-label="Remove photo"
          className="flex size-8 items-center justify-center rounded-lg bg-surface-3 text-destructive hover:opacity-80"
        >
          <Trash2 aria-hidden="true" className="size-[15px]" />
        </button>
      </div>
      {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}

      <p className="pt-1 text-[11px] font-semibold tracking-[0.04em] text-faint uppercase">Readability</p>
      <div className="grid grid-cols-4 gap-2">
        {TREATMENTS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={settings.photoTreatment === id}
            onClick={() => updateSettings({ photoTreatment: id })}
            className="flex flex-col items-center gap-1 rounded-xl border border-transparent bg-muted py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground aria-pressed:border-primary aria-pressed:bg-primary-soft aria-pressed:text-primary-soft-foreground"
          >
            <Icon aria-hidden="true" className="size-[18px]" />
            {label}
          </button>
        ))}
      </div>

      <TableStylePicker />

      <div className="space-y-3 pt-1">
        {showBlur ? (
          <Slider label="Blur behind timetable" value={settings.photoBlur} onChange={(photoBlur) => updateSettings({ photoBlur })} />
        ) : null}
        <Slider label="Dim photo" value={settings.photoDim} onChange={(photoDim) => updateSettings({ photoDim })} />
        <div className="flex items-center justify-between text-[13px]">
          Text colour
          <Segmented
            label="Text colour"
            value={settings.photoTextColor}
            onChange={(photoTextColor) => updateSettings({ photoTextColor })}
            options={[
              { value: "auto", label: "Auto" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
            className="rounded-[10px] p-[3px]"
            itemClassName="rounded-lg px-2.5 py-1 text-xs font-medium"
          />
        </div>
      </div>
    </div>
  );
}
