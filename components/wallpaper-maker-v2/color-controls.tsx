"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useWallpaper } from "./wallpaper-context";

const FALLBACK_COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export function ColorControls() {
  const { entries, colorOverrides, updateColorOverride, resetColorOverrides } = useWallpaper();

  const subjects = useMemo(() => {
    const unique = Array.from(
      new Set(entries.map((entry) => entry.subjectKey || entry.course || "DEFAULT")),
    );
    return unique.sort();
  }, [entries]);

  if (subjects.length === 0) {
    return (
      <div className="pt-2 pb-1 text-xs text-muted-foreground">
        Add classes first to customize subject colors.
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2 pb-1">
      <div className="space-y-2 max-h-52 overflow-auto pr-1">
        {subjects.map((subject, index) => {
          const color = colorOverrides[subject] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]!;
          return (
            <div key={subject} className="flex items-center gap-2.5">
              <input
                type="color"
                value={color}
                onChange={(e) => updateColorOverride(subject, e.target.value)}
                className="h-7 w-10 rounded border border-border bg-transparent cursor-pointer"
                aria-label={`Color for ${subject}`}
              />
              <span className="text-xs text-foreground truncate">{subject}</span>
            </div>
          );
        })}
      </div>

      <Button type="button" variant="outline" size="sm" className="h-8 w-full text-xs" onClick={resetColorOverrides}>
        Reset Colors
      </Button>
    </div>
  );
}
