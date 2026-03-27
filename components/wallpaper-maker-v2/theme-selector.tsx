"use client";

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
        preview: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)",
      },
    ],
  },
  {
    title: "Solid Colors",
    options: [
      {
        id: "solid",
        name: "Indigo",
        preview: "#4f46e5",
      },
      {
        id: "midnight",
        name: "Midnight Blue",
        preview: "#1d3557",
      },
      {
        id: "evergreen",
        name: "Evergreen",
        preview: "#1f5f4a",
      },
      {
        id: "terracotta",
        name: "Terracotta",
        preview: "#c65d3b",
      },
    ],
  },
];

export function ThemeSelector() {
  const { settings, updateSettings } = useWallpaper();

  return (
    <Accordion
      multiple
      defaultValue={themeGroups.map((group) => group.title)}
      className="space-y-3"
    >
      {themeGroups.map((group) => (
        <AccordionItem
          key={group.title}
          value={group.title}
          className="rounded-xl border border-slate-200 bg-slate-50/60 px-2.5"
        >
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
                      isSelected ? "border-[#21d4cf]" : "border-slate-200 bg-white"
                    )}
                  >
                    <div className="h-16 w-full" style={{ background: theme.preview }} />

                    <div className="bg-background px-2 py-1.5">
                      <div
                        className={cn(
                          "truncate text-center text-xs font-medium transition-colors",
                          isSelected ? "text-[#0f766e]" : "text-slate-700"
                        )}
                      >
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
    </Accordion>
  );
}
