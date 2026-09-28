"use client";

import { useState, type ComponentType } from "react";
import { CustomPicker, type InjectedColorProps } from "react-color";
import { Hue, Saturation } from "react-color/lib/components/common";
import { Pipette, Plus, X } from "lucide-react";
import { useWallpaper, type ThemeId } from "./wallpaper-context";
import { getThemePreset } from "./themes/theme-presets";
import { cn } from "@/lib/utils";

const THEMES: { id: ThemeId; name: string }[] = [
  { id: "night", name: "Night" },
  { id: "ios-default", name: "Paper" },
  { id: "gradient", name: "Aurora" },
];

const SWATCHES = ["#0F4C4A", "#1A1A1A", "#9353D3", "#006FEE", "#8A2B3A", "#2F4F2F", "#F5A524", "#EDEDED"];
const CUSTOM_COLOR_FALLBACK = "#0F4C4A";

function SaturationPointer() {
  return <div className="size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_#0006]" />;
}

function HuePointer() {
  return <div className="size-4 -translate-x-1/2 -translate-y-0.5 rounded-full border-2 border-white shadow-[0_0_0_1px_#0006]" />;
}

// react-color injects hsl/hsv at runtime; its typings only describe `color`.
type CommonProps = ComponentType<Record<string, unknown>>;
const SaturationArea = Saturation as unknown as CommonProps;
const HueSlider = Hue as unknown as CommonProps;

const ColorArea = CustomPicker(function ColorArea(props: InjectedColorProps) {
  return (
    <>
      <div className="relative h-[150px] overflow-hidden rounded-lg">
        <SaturationArea {...props} pointer={SaturationPointer} />
      </div>
      <div className="relative mt-4 h-3 rounded-full [&>div]:rounded-full">
        <HueSlider {...props} pointer={HuePointer} />
      </div>
    </>
  );
});

export function ThemeSelector() {
  const { settings, updateSettings } = useWallpaper();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [before, setBefore] = useState<{ themeId: ThemeId; customBackground?: string } | null>(null);
  const customColor = settings.customBackground ?? CUSTOM_COLOR_FALLBACK;
  const [hexDraft, setHexDraft] = useState(customColor);

  function setCustom(color: string) {
    setHexDraft(color.toUpperCase());
    updateSettings({ themeId: "custom", customBackground: color.toUpperCase() });
  }

  function openPicker() {
    setBefore({ themeId: settings.themeId, customBackground: settings.customBackground });
    setCustom(customColor);
    setPickerOpen(true);
  }

  function reset() {
    if (before) updateSettings(before);
    setPickerOpen(false);
  }

  const isCustom = settings.themeId === "custom";

  return (
    <div className="relative">
      <div className="grid grid-cols-4 gap-2">
        {THEMES.map((theme) => {
          const active = settings.themeId === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                updateSettings({ themeId: theme.id });
                setPickerOpen(false);
              }}
              className="group flex flex-col items-center gap-2 text-xs text-muted-foreground aria-pressed:font-medium aria-pressed:text-foreground"
            >
              <span
                className={cn("h-16 w-full rounded-xl border-2", active ? "border-primary" : "border-border group-hover:border-surface-3")}
                style={{ background: getThemePreset(theme.id).background }}
              />
              {theme.name}
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={isCustom}
          aria-expanded={pickerOpen}
          onClick={() => (pickerOpen ? setPickerOpen(false) : openPicker())}
          className="group flex flex-col items-center gap-2 text-xs text-muted-foreground aria-pressed:font-medium aria-pressed:text-foreground"
        >
          <span
            className={cn(
              "flex h-16 w-full items-center justify-center rounded-xl border-2",
              isCustom ? "border-primary text-white" : "border-border bg-muted group-hover:border-surface-3",
            )}
            style={isCustom ? { background: customColor } : undefined}
          >
            {isCustom ? <Pipette aria-hidden="true" className="size-4 drop-shadow" /> : <Plus aria-hidden="true" className="size-5" />}
          </span>
          Custom
        </button>
      </div>

      {pickerOpen ? (
        <div
          role="dialog"
          aria-label="Custom background"
          className="absolute top-full right-0 z-30 mt-3 w-[284px] rounded-2xl border border-border bg-card p-4 shadow-[0_16px_40px_#00000059] lg:top-[-8px] lg:right-[calc(100%+40px)] lg:mt-0"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Custom background</p>
            <button type="button" onClick={() => setPickerOpen(false)} aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
          <ColorArea color={customColor} onChange={(color) => setCustom(color.hex)} />
          <label className="mt-4 flex h-9 items-center gap-2 rounded-lg bg-muted px-2.5 focus-within:ring-2 focus-within:ring-primary">
            <span aria-hidden="true" className="size-4 shrink-0 rounded" style={{ background: customColor }} />
            <span className="sr-only">Hex colour</span>
            <input
              value={hexDraft}
              onChange={(event) => {
                const value = event.target.value.toUpperCase();
                setHexDraft(value);
                if (/^#[0-9A-F]{6}$/.test(value)) setCustom(value);
              }}
              className="w-full bg-transparent font-mono text-[13px] outline-none"
            />
          </label>
          <p className="mt-4 text-xs text-muted-foreground">Swatches</p>
          <div className="mt-2 flex justify-between">
            {SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setCustom(hex)}
                aria-label={`Use ${hex}`}
                aria-pressed={customColor.toUpperCase() === hex}
                className="size-6 rounded-md border border-border ring-offset-2 ring-offset-card aria-pressed:ring-2 aria-pressed:ring-foreground"
                style={{ background: hex }}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={reset} className="h-9 rounded-lg bg-surface-3 text-sm hover:opacity-90">Reset</button>
            <button type="button" onClick={() => setPickerOpen(false)} className="h-9 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:opacity-90">Apply</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
