"use client";

import { useEffect, useState } from "react";
import { SketchPicker, type ColorResult } from "react-color";
import { useWallpaper, type ThemeId } from "./wallpaper-context";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ThemeOption {
  id: ThemeId;
  name: string;
  preview: string; // gradient or color for preview
}

interface ThemeGroup {
  title: string;
  options: ThemeOption[];
}

const themeGroups: ThemeGroup[] = [
  {
    title: "Gradient Themes",
    options: [
      {
        id: "ios-default",
        name: "iOS Default",
        preview:
          "radial-gradient(circle at top, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0) 28%), linear-gradient(180deg, #ded7cb 0%, #d7cfbe 52%, #ccc3b2 100%)",
      },
      {
        id: "light",
        name: "Light & Clean",
        preview: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      },
      {
        id: "gradient",
        name: "Gradient Aurora",
        preview: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      },
      {
        id: "glass",
        name: "Glassmorphism",
        preview:
          "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)",
      },
    ],
  },
];

const CUSTOM_COLOR_FALLBACK = "#0F766E";
const CUSTOM_SWATCHES = [
  "#D0021B",
  "#F5A623",
  "#F8E71C",
  "#8B572A",
  "#7ED321",
  "#417505",
  "#BD10E0",
  "#9013FE",
  "#4A90E2",
  "#50E3C2",
  "#B8E986",
  "#000000",
  "#4A4A4A",
  "#9B9B9B",
  "#FFFFFF",
];

function normalizeHexColor(value?: string): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (/^#([a-f\d]{6})$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const shortHexMatch = trimmed.match(/^#([a-f\d]{3})$/i);
  if (!shortHexMatch) return null;

  const [, shortHex] = shortHexMatch;
  return `#${shortHex
    .split("")
    .map((char) => `${char}${char}`)
    .join("")
    .toUpperCase()}`;
}

export function ThemeSelector() {
  const { settings, updateSettings } = useWallpaper();
  const customColor =
    normalizeHexColor(settings.customBackground) ?? CUSTOM_COLOR_FALLBACK;
  const [pickerColor, setPickerColor] = useState(customColor);

  useEffect(() => {
    setPickerColor(customColor);
  }, [customColor]);

  function selectCustomColor(color: string) {
    updateSettings({
      themeId: "custom",
      customBackground: color,
    });
  }

  function handleCustomColorChange(color: ColorResult) {
    const nextColor = color.hex.toUpperCase();
    setPickerColor(nextColor);
    updateSettings({
      themeId: "custom",
      customBackground: nextColor,
    });
  }

  function handleCustomColorChangeComplete(color: ColorResult) {
    selectCustomColor(color.hex.toUpperCase());
  }

  return (
    <Accordion
      multiple
      defaultValue={[
        ...themeGroups.map((group) => group.title),
        "Custom Color",
      ]}
      className="space-y-3">
      {themeGroups.map((group) => (
        <AccordionItem
          key={group.title}
          value={group.title}
          className="rounded-xl border border-slate-200 bg-slate-50/60 px-2.5">
          <AccordionTrigger className="px-1 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 hover:no-underline">
            {group.title}
          </AccordionTrigger>
          <AccordionContent className="pb-2">
            <div className="grid grid-cols-3 gap-2">
              {group.options.map((theme) => {
                const isSelected = settings.themeId === theme.id;

                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => updateSettings({ themeId: theme.id })}
                    className={cn(
                      "relative overflow-hidden rounded-lg border-2 transition-all",
                      "hover:border-[#21d4cf]/60",
                      isSelected
                        ? "border-[#21d4cf]"
                        : "border-slate-200 bg-white",
                    )}>
                    <div
                      className="h-16 w-full"
                      style={{ background: theme.preview }}
                    />

                    <div className="bg-background px-2 py-1.5">
                      <div
                        className={cn(
                          "truncate text-center text-xs font-medium transition-colors",
                          isSelected ? "text-[#0f766e]" : "text-slate-700",
                        )}>
                        {theme.name}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-white shadow-lg" />
                    )}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}

      <AccordionItem
        value="Custom Color"
        className="rounded-xl border border-slate-200 bg-slate-50/60 px-2.5">
        <AccordionTrigger className="px-1 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 hover:no-underline">
          Custom Color
        </AccordionTrigger>
        <AccordionContent className="pb-2">
          <div
            className={cn(
              "rounded-xl border p-2.5 transition-all",
              settings.themeId === "custom"
                ? "border-[#21d4cf] bg-[#ecfeff]"
                : "border-slate-200 bg-white",
            )}>
            <div className="space-y-2.5">
              <div>
                <div>
                  <div className="text-[13px] font-semibold text-slate-900">
                    Custom Color
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-500">
                    Pick any solid background color.
                  </p>
                </div>
              </div>

              <div className="mx-auto w-full max-w-68 overflow-hidden rounded-lg border border-slate-200 bg-white">
                <SketchPicker
                  color={pickerColor}
                  onChange={handleCustomColorChange}
                  onChangeComplete={handleCustomColorChangeComplete}
                  presetColors={CUSTOM_SWATCHES}
                  width="252px"
                  styles={{
                    default: {
                      picker: {
                        width: "252px",
                        boxShadow: "none",
                        borderRadius: "0",
                        background: "#ffffff",
                        padding: "10px",
                        fontFamily: "inherit",
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
