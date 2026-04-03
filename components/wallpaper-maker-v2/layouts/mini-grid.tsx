"use client";

import { useMemo } from "react";
import type { TimetableEntry } from "@/lib/types";
import { useWallpaper } from "../wallpaper-context";

export interface MiniGridProps {
  entries: TimetableEntry[];
  colorOverrides: Record<string, string>;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

function getDayShort(day: string): string {
  const d = day.trim().toLowerCase();
  if (d.startsWith("mon")) return "Mon";
  if (d.startsWith("tue")) return "Tue";
  if (d.startsWith("wed")) return "Wed";
  if (d.startsWith("thu")) return "Thu";
  if (d.startsWith("fri")) return "Fri";
  return "";
}

function timeToHour(time: string): number {
  const [h] = time.split(":").map(Number);
  return h ?? 0;
}

function formatTimeLabel(start?: string, end?: string): string {
  const safeStart = start?.slice(0, 5) ?? "";
  const safeEnd = end?.slice(0, 5) ?? "";
  if (!safeStart && !safeEnd) return "";
  if (!safeEnd) return safeStart;
  return `${safeStart}-${safeEnd}`;
}

export function MiniGrid({ entries, colorOverrides }: MiniGridProps) {
  const { settings } = useWallpaper();

  const gridData = useMemo(() => {
    const grid = new Map<string, TimetableEntry>();
    
    for (const entry of entries) {
      const day = getDayShort(entry.day || "");
      if (!day || !DAYS.includes(day)) continue;
      
      const hour = timeToHour(entry.start || "00:00");
      const key = `${day}-${hour}`;
      
      if (!grid.has(key)) {
        grid.set(key, entry);
      }
    }
    
    return grid;
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/70 text-sm px-8 text-center">
        Add classes to see grid view
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto p-3">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-2 shadow-sm">
        {/* Header Row */}
        <div className="grid grid-cols-6 gap-1 mb-1">
          <div className="text-[9px] font-bold text-slate-500 text-center py-1">Time</div>
          {DAYS.map(day => (
            <div key={day} className="text-[9px] font-bold text-slate-700 text-center py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Grid Rows */}
        <div className="space-y-0.5">
          {HOURS.map(hour => {
            const hour12 = hour % 12 === 0 ? 12 : hour % 12;
            const ampm = hour >= 12 ? "PM" : "AM";

            return (
              <div key={hour} className="grid grid-cols-6 gap-1">
                {/* Time Label */}
                <div className="text-[8px] text-slate-500 font-semibold text-center py-1.5 flex items-center justify-center">
                  {hour12}{ampm}
                </div>

                {/* Day Cells */}
                {DAYS.map(day => {
                  const key = `${day}-${hour}`;
                  const entry = gridData.get(key);

                  if (!entry) {
                    return (
                      <div
                        key={key}
                        className="bg-slate-100/50 rounded border border-slate-200/50 min-h-[28px]"
                      />
                    );
                  }

                  const colorKey = entry.subjectKey || entry.course || "DEFAULT";
                  const color = colorOverrides[colorKey] || "#3b82f6";
                  const courseCode = (entry.course || entry.subjectKey || "").split(" ")[0] || "";

                  return (
                    <div
                      key={key}
                      className="rounded px-1 py-1.5 min-h-[28px] flex flex-col items-center justify-center
                        border-2 shadow-sm"
                      style={{
                        backgroundColor: `${color}15`,
                        borderColor: color,
                      }}
                    >
                      <div
                        className="text-[9px] font-black leading-tight text-center"
                        style={{ color }}
                      >
                        {courseCode}
                      </div>
                      {settings.showTime ? (
                        <div className="text-[7px] text-slate-600 leading-tight mt-0.5 text-center">
                          {formatTimeLabel(entry.start, entry.end)}
                        </div>
                      ) : null}
                      {settings.showVenue && entry.venue ? (
                        <div className="text-[6.5px] text-slate-500 leading-tight mt-0.5 text-center max-w-full truncate">
                          {entry.venue}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
