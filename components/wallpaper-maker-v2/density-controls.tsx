"use client";

import { useWallpaper, type DensityLevel } from "./wallpaper-context";
import { cn } from "@/lib/utils";

const densityOptions: { value: DensityLevel; label: string; description: string }[] = [
  { value: "ultra-compact", label: "Ultra Compact", description: "Maximum info" },
  { value: "compact", label: "Compact", description: "Balanced" },
  { value: "comfortable", label: "Comfortable", description: "More space" },
  { value: "spacious", label: "Spacious", description: "Maximum breathing room" },
];

export function DensityControls() {
  const { settings, updateSettings } = useWallpaper();

  return (
    <div className="space-y-2 pt-2 pb-1">
      {densityOptions.map((option) => {
        const isSelected = settings.density === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => updateSettings({ density: option.value })}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg border-2 transition-all",
              "hover:border-[#21d4cf]/60 hover:bg-muted/30",
              isSelected
                ? "border-[#21d4cf] bg-[#21d4cf]/10"
                : "border-border bg-background"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div
                  className={cn(
                    "text-xs font-semibold transition-colors",
                    isSelected ? "text-[#0f766e]" : "text-foreground"
                  )}
                >
                  {option.label}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {option.description}
                </div>
              </div>
              {isSelected && (
                <div className="h-2 w-2 rounded-full bg-[#21d4cf] flex-shrink-0" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
