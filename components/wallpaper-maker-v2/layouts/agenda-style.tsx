"use client";

import { useMemo } from "react";
import type { TimetableEntry } from "@/lib/types";
import { useWallpaper } from "../wallpaper-context";

export interface AgendaStyleProps {
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

export function AgendaStyle({ entries, colorOverrides }: AgendaStyleProps) {
  const { settings } = useWallpaper();

  const dayGroups = useMemo(() => {
    const groups = new Map<string, TimetableEntry[]>();
    
    for (const entry of entries) {
      const day = getDayName(entry.day || "Unknown");
      if (!groups.has(day)) groups.set(day, []);
      groups.get(day)!.push(entry);
    }
    
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
        Add classes to see agenda view
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto">
      <div className="bg-white/95 backdrop-blur-sm p-4 min-h-full">
        {/* Header */}
        <div className="mb-4 pb-3 border-b-2 border-slate-300">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            {settings.titleText || "My Timetable"}
          </h2>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
            Weekly Schedule
          </p>
        </div>

        {/* Agenda List */}
        <div className="space-y-4">
          {dayGroups.map(({ day, entries: dayEntries }) => (
            <div key={day}>
              {/* Day Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  {day}
                </div>
                <div className="flex-1 h-px bg-slate-300" />
                <div className="text-[9px] text-slate-500 font-semibold">
                  {dayEntries.length} class{dayEntries.length !== 1 ? "es" : ""}
                </div>
              </div>

              {/* Classes */}
              <div className="space-y-2 pl-2">
                {dayEntries.map((entry, idx) => {
                  const colorKey = entry.subjectKey || entry.course || "DEFAULT";
                  const color = colorOverrides[colorKey] || "#3b82f6";

                  return (
                    <div key={idx} className="flex gap-3">
                      {/* Time */}
                      {settings.showTime && (
                        <div className="w-16 flex-shrink-0">
                          <div className="text-[10px] font-bold text-slate-700">
                            {entry.start}
                          </div>
                          <div className="text-[9px] text-slate-500">
                            {entry.end}
                          </div>
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex-1 min-w-0 pb-2 border-l-2 pl-3" style={{ borderColor: color }}>
                        {settings.showCourseCode && (
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            {entry.course || entry.subjectKey}
                          </div>
                        )}
                        
                        {entry.section && (
                          <div className="text-[10px] text-slate-600 leading-tight mt-0.5">
                            {entry.section}
                          </div>
                        )}

                        {settings.showVenue && entry.venue && (
                          <div className="text-[10px] text-slate-500 leading-tight mt-1">
                            📍 {entry.venue}
                          </div>
                        )}

                        {settings.showLecturer && entry.lecturer && (
                          <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                            👤 {entry.lecturer}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
