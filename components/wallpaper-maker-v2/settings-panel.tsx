"use client";

import type { ReactNode } from "react";
import { Droplet, ImageIcon, Palette, Smartphone } from "lucide-react";
import { Segmented } from "@/components/ui/segmented";
import { Switch } from "@/components/ui/switch";
import { EXPORT_DEVICE } from "./device-presets";
import { PhotoPanel, StylePicker, TableStylePicker } from "./background-panels";
import { TABLE_OFFSET_LIMIT } from "./layouts/wallpaper-styles";
import { ThemeSelector } from "./theme-selector";
import { useWallpaper, type WallpaperSettings } from "./wallpaper-context";

const CLASS_FIELDS: { key: keyof WallpaperSettings; label: string }[] = [
  { key: "showVenue", label: "Room" },
  { key: "showTime", label: "Time" },
  { key: "showLecturer", label: "Lecturer" },
  { key: "showWidgetPosition", label: "Leave space for clock" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-medium tracking-[0.04em] text-muted-foreground uppercase">{title}</h3>
      {children}
    </section>
  );
}

export function SettingsPanel() {
  const { settings, updateSettings } = useWallpaper();
  const splitPhoto = settings.backgroundMode === "photo" && Boolean(settings.photo) && settings.photoTreatment === "split";

  return (
    <div className="space-y-7 px-6 py-6">
      <Section title="Device">
        <p className="flex h-10 items-center gap-2.5 rounded-xl bg-muted px-3 text-sm">
          <Smartphone aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          {EXPORT_DEVICE.label}
          <span className="ml-auto text-xs text-faint">
            {EXPORT_DEVICE.width * EXPORT_DEVICE.pixelRatio} × {EXPORT_DEVICE.height * EXPORT_DEVICE.pixelRatio}
          </span>
        </p>
      </Section>

      <Section title="Background">
        <Segmented
          label="Background"
          value={settings.backgroundMode}
          onChange={(backgroundMode) => updateSettings({ backgroundMode })}
          options={[
            { value: "style", label: <><Palette aria-hidden="true" />Style</> },
            { value: "colour", label: <><Droplet aria-hidden="true" />Colour</> },
            { value: "photo", label: <><ImageIcon aria-hidden="true" />Photo</> },
          ]}
          className="mb-3"
        />
        {settings.backgroundMode === "style" ? <StylePicker /> : null}
        {settings.backgroundMode === "colour" ? (
          <div className="space-y-4">
            <ThemeSelector />
            <TableStylePicker />
          </div>
        ) : null}
        {settings.backgroundMode === "photo" ? <PhotoPanel /> : null}
      </Section>

      <Section title="Table position">
        {splitPhoto ? (
          <p className="text-sm text-muted-foreground">Split keeps the timetable on its white panel.</p>
        ) : (
          <>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              Up
              <input
                type="range"
                min={-TABLE_OFFSET_LIMIT}
                max={TABLE_OFFSET_LIMIT}
                value={settings.tableOffset}
                onChange={(event) => updateSettings({ tableOffset: Number(event.target.value) })}
                aria-label="Table position"
                className="h-4 flex-1 cursor-pointer accent-primary"
              />
              Down
              <button
                type="button"
                onClick={() => updateSettings({ tableOffset: 0 })}
                disabled={settings.tableOffset === 0}
                className="rounded-lg bg-muted px-2.5 py-1 font-medium text-foreground hover:bg-surface-3 disabled:opacity-50"
              >
                Reset
              </button>
            </div>
            <p className="mt-2 text-xs text-faint">Or drag the timetable in the preview.</p>
          </>
        )}
      </Section>

      <Section title="Show on each class">
        <div className="space-y-3">
          {CLASS_FIELDS.map(({ key, label }) => (
            <label key={key} className="flex cursor-pointer items-center justify-between text-sm">
              {label}
              <Switch
                checked={Boolean(settings[key])}
                onCheckedChange={(checked) => updateSettings({ [key]: checked })}
              />
            </label>
          ))}
        </div>
      </Section>
    </div>
  );
}
