"use client";

import { useMemo } from "react";
import type { TimetableEntry } from "@/lib/types";
import { useWallpaper } from "../wallpaper-context";
import { Calendar } from "lucide-react";

export interface DayCardsProps {
  entries: TimetableEntry[];
  colorOverrides: Record<string, string>;
}

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getDayName(day: string): string {
  const d = day.trim().toLowerCase();
  if (d.startsWith("mon")) return "Monday";
  if (d.startsWith("tue")) return "Tuesday";
  if (d.startsWith("wed")) return "Wednesday";
  if (d.startsWith("thu")) return "Thursday";
  if (d.startsWith("fri")) return "Friday";
  if (d.startsWith("sat")) return "Saturday";
  if (d.startsWith("sun")) return "Sunday";
  return day;
}

export function DayCards({ entries, colorOverrides }: DayCardsProps) {
  const { settings } = useWallpaper();

  const dayGroups = useMemo(() => {
    const groups = new Map<string, TimetableEntry[]>();
    
    for (const entry of entries) {
      const day = getDayName(entry.day || "Unknown");
      if (!groups.has(day)) groups.set(day, []);
      groups.get(day)!.push(entry);
    }
    
    // Sort by day order
    const sorted = DAYS_ORDER
      .filter(day => groups.has(day))
      .map(day => ({
        day,
        entries: groups.get(day)!.sort((a, b) => 
          (a.start || "").localeCompare(b.start || "")
        ),
      }));
    
    return sorted;
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/70 text-sm px-8 text-center">
        Add classes to see day cards
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto p-4 space-y-2.5">
      {dayGroups.map(({ day, entries: dayEntries }) => {
        const totalHours = dayEntries.reduce((sum, entry) => {
          const start = entry.start?.split(":").map(Number) || [0, 0];
          const end = entry.end?.split(":").map(Number) || [0, 0];
          const duration = (end[0]! * 60 + end[1]!) - (start[0]! * 60 + start[1]!);
          return sum + duration / 60;
        }, 0);

        return (
          <div
            key={day}
            className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/30"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-600" />
                <h3 className="font-bold text-sm text-slate-900">{day}</h3>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {dayEntries.length} class{dayEntries.length !== 1 ? "es" : ""} • {totalHours.toFixed(1)}h
              </div>
            </div>

            {/* Classes */}
            <div className="space-y-1.5">
              {dayEntries.map((entry, idx) => {
                const colorKey = entry.subjectKey || entry.course || "DEFAULT";
                const color = colorOverrides[colorKey] || "#3b82f6";

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Color dot */}
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />

                    {/* Time */}
                    {settings.showTime && (
                      <div className="text-[10px] font-semibold text-slate-600 w-20">
                        {entry.start}
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      {settings.showCourseCode && (
                        <div className="text-[11px] font-bold text-slate-900 leading-tight truncate">
                          {entry.course || entry.subjectKey}
                        </div>
                      )}
                      {settings.showVenue && entry.venue && (
                        <div className="text-[9px] text-slate-500 leading-tight truncate">
                          {entry.venue}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
