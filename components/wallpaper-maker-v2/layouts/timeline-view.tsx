"use client";

import { useMemo } from "react";
import type { TimetableEntry } from "@/lib/types";
import { useWallpaper } from "../wallpaper-context";

export interface TimelineViewProps {
  entries: TimetableEntry[];
  colorOverrides: Record<string, string>;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function getDayIndex(day: string): number {
  const d = day.trim().toLowerCase();
  if (d.startsWith("mon")) return 0;
  if (d.startsWith("tue")) return 1;
  if (d.startsWith("wed")) return 2;
  if (d.startsWith("thu")) return 3;
  if (d.startsWith("fri")) return 4;
  if (d.startsWith("sat")) return 5;
  if (d.startsWith("sun")) return 6;
  return 0;
}

export function TimelineView({ entries, colorOverrides }: TimelineViewProps) {
  const { settings } = useWallpaper();

  const timelineData = useMemo(() => {
    if (entries.length === 0) return { entries: [], minTime: 8 * 60, maxTime: 18 * 60 };

    const sortedEntries = [...entries].sort((a, b) => {
      const dayDiff = getDayIndex(a.day || "") - getDayIndex(b.day || "");
      if (dayDiff !== 0) return dayDiff;
      return timeToMinutes(a.start || "00:00") - timeToMinutes(b.start || "00:00");
    });

    const times = sortedEntries.map(e => timeToMinutes(e.start || "00:00"));
    const minTime = Math.max(7 * 60, Math.floor(Math.min(...times) / 60) * 60);
    const maxTime = Math.min(22 * 60, Math.ceil(Math.max(...times.map((_, i) => 
      timeToMinutes(sortedEntries[i]!.end || "00:00"))) / 60) * 60);

    return { entries: sortedEntries, minTime, maxTime };
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/70 text-sm px-8 text-center">
        Add classes to see timeline view
      </div>
    );
  }

  const { entries: sortedEntries, minTime, maxTime } = timelineData;
  const totalMinutes = maxTime - minTime;
  const hourMarks = [];
  for (let m = minTime; m <= maxTime; m += 60) {
    hourMarks.push(m);
  }

  return (
    <div className="w-full h-full overflow-auto p-4">
      <div className="relative" style={{ minHeight: `${totalMinutes * 0.8}px` }}>
        {/* Hour markers */}
        {hourMarks.map(minutes => {
          const hour = Math.floor(minutes / 60);
          const y = ((minutes - minTime) / totalMinutes) * 100;
          const hour12 = hour % 12 === 0 ? 12 : hour % 12;
          const ampm = hour >= 12 ? "PM" : "AM";
          
          return (
            <div
              key={minutes}
              className="absolute left-0 right-0 flex items-center"
              style={{ top: `${y}%` }}
            >
              <div className="text-[10px] text-white/60 font-semibold w-12 text-right pr-2">
                {hour12} {ampm}
              </div>
              <div className="flex-1 h-px bg-white/20" />
            </div>
          );
        })}

        {/* Timeline blocks */}
        <div className="relative pl-14 pr-2">
          {sortedEntries.map((entry, idx) => {
            const startMin = timeToMinutes(entry.start || "00:00");
            const endMin = timeToMinutes(entry.end || "00:00");
            const top = ((startMin - minTime) / totalMinutes) * 100;
            const height = ((endMin - startMin) / totalMinutes) * 100;
            
            const colorKey = entry.subjectKey || entry.course || "DEFAULT";
            const color = colorOverrides[colorKey] || "#3b82f6";

            return (
              <div
                key={idx}
                className="absolute left-14 right-2 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1.5 
                  border-l-4 shadow-sm overflow-hidden"
                style={{
                  top: `${top}%`,
                  height: `max(${height}%, 40px)`,
                  borderLeftColor: color,
                }}
              >
                <div className="text-[10px] font-bold text-slate-900 leading-tight truncate">
                  {entry.course || entry.subjectKey}
                </div>
                {settings.showTime && (
                  <div className="text-[9px] text-slate-600 leading-tight mt-0.5">
                    {entry.start} - {entry.end}
                  </div>
                )}
                {settings.showVenue && entry.venue && (
                  <div className="text-[9px] text-slate-500 leading-tight mt-0.5 truncate">
                    📍 {entry.venue}
                  </div>
                )}
                <div className="text-[9px] text-slate-400 leading-tight mt-0.5">
                  {entry.day}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
