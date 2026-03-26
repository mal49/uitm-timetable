"use client";

import { useMemo } from "react";
import type { TimetableEntry } from "@/lib/types";
import { useWallpaper } from "../wallpaper-context";
import { Clock, MapPin } from "lucide-react";

export interface CompactListProps {
  entries: TimetableEntry[];
  colorOverrides: Record<string, string>;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getDayShort(day: string): string {
  const d = day.trim().toLowerCase();
  if (d.startsWith("mon")) return "Mon";
  if (d.startsWith("tue")) return "Tue";
  if (d.startsWith("wed")) return "Wed";
  if (d.startsWith("thu")) return "Thu";
  if (d.startsWith("fri")) return "Fri";
  if (d.startsWith("sat")) return "Sat";
  if (d.startsWith("sun")) return "Sun";
  return day.slice(0, 3);
}

export function CompactList({ entries, colorOverrides }: CompactListProps) {
  const { settings } = useWallpaper();

  // Group and sort entries by day
  const groupedEntries = useMemo(() => {
    const groups = new Map<string, TimetableEntry[]>();
    
    for (const entry of entries) {
      const day = entry.day || "Unknown";
      if (!groups.has(day)) groups.set(day, []);
      groups.get(day)!.push(entry);
    }
    
    // Sort by day order and time
    const sorted = Array.from(groups.entries()).sort((a, b) => {
      const dayA = DAYS.findIndex(d => d.toLowerCase().startsWith(a[0].toLowerCase()));
      const dayB = DAYS.findIndex(d => d.toLowerCase().startsWith(b[0].toLowerCase()));
      return (dayA === -1 ? 999 : dayA) - (dayB === -1 ? 999 : dayB);
    });
    
    // Sort entries within each day by start time
    for (const [, dayEntries] of sorted) {
      dayEntries.sort((a, b) => (a.start || "").localeCompare(b.start || ""));
    }
    
    return sorted;
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/70 text-sm px-8 text-center">
        Add classes to your timetable to see them here
      </div>
    );
  }

  const densityMap = {
    "ultra-compact": { gap: "gap-1", py: "py-1.5", px: "px-2.5", text: "text-[10px]", subtitle: "text-[9px]" },
    "compact": { gap: "gap-1.5", py: "py-2", px: "px-3", text: "text-xs", subtitle: "text-[10px]" },
    "comfortable": { gap: "gap-2", py: "py-2.5", px: "px-3.5", text: "text-xs", subtitle: "text-[10px]" },
    "spacious": { gap: "gap-3", py: "py-3", px: "px-4", text: "text-sm", subtitle: "text-xs" },
  };
  
  const density = densityMap[settings.density];

  return (
    <div className={`w-full h-full overflow-auto p-4 space-y-3`}>
      {groupedEntries.map(([day, dayEntries]) => (
        <div key={day} className="space-y-1.5">
          {/* Day Header */}
          {settings.showDayLabels && (
            <div className="text-white/90 font-bold text-xs tracking-wide uppercase px-1">
              {getDayShort(day)}
            </div>
          )}
          
          {/* Classes for this day */}
          <div className={`space-y-${density.gap === 'gap-1' ? '1' : density.gap === 'gap-1.5' ? '1.5' : density.gap === 'gap-2' ? '2' : '3'}`}>
            {dayEntries.map((entry, idx) => {
              const colorKey = entry.subjectKey || entry.course || "DEFAULT";
              const color = colorOverrides[colorKey] || "#3b82f6";
              
              return (
                <div
                  key={idx}
                  className={`bg-white/95 backdrop-blur-sm rounded-lg ${density.px} ${density.py} 
                    border-l-4 shadow-sm transition-all hover:shadow-md`}
                  style={{ borderLeftColor: color }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Course Code/Name */}
                      {settings.showCourseCode && (
                        <div className={`font-bold text-slate-900 ${density.text} leading-tight`}>
                          {entry.course || entry.subjectKey || "CLASS"}
                        </div>
                      )}
                      
                      {/* Section */}
                      {entry.section && (
                        <div className={`text-slate-600 ${density.subtitle} leading-tight mt-0.5`}>
                          {entry.section}
                        </div>
                      )}
                      
                      {/* Time */}
                      {settings.showTime && (
                        <div className={`flex items-center gap-1 text-slate-500 ${density.subtitle} mt-1`}>
                          <Clock className="h-3 w-3" />
                          <span>{entry.start} - {entry.end}</span>
                        </div>
                      )}
                      
                      {/* Venue */}
                      {settings.showVenue && entry.venue && (
                        <div className={`flex items-center gap-1 text-slate-500 ${density.subtitle} mt-0.5`}>
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{entry.venue}</span>
                        </div>
                      )}
                      
                      {/* Lecturer */}
                      {settings.showLecturer && entry.lecturer && (
                        <div className={`text-slate-500 ${density.subtitle} mt-0.5 truncate`}>
                          👤 {entry.lecturer}
                        </div>
                      )}
                    </div>
                    
                    {/* Color Indicator */}
                    <div 
                      className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
