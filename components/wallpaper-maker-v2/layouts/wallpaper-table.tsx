"use client";

import { useMemo } from "react";
import type { TimetableEntry } from "@/lib/types";
import { useWallpaper } from "../wallpaper-context";

export interface WallpaperTableProps {
  entries: TimetableEntry[];
  colorOverrides: Record<string, string>;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const START_HOUR = 9;
const END_HOUR = 17;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const ROW_HEIGHT_PERCENT = 100 / TOTAL_HOURS;

function getDayIndex(day: string): number {
  const value = day.trim().toLowerCase();
  if (value.startsWith("mon")) return 0;
  if (value.startsWith("tue")) return 1;
  if (value.startsWith("wed")) return 2;
  if (value.startsWith("thu")) return 3;
  if (value.startsWith("fri")) return 4;
  return -1;
}

function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return (hour ?? 0) * 60 + (minute ?? 0);
}

function formatHourLabel(hour24: number): string {
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const amPm = hour24 >= 12 ? "PM" : "AM";
  return `${hour12.toString().padStart(2, "0")}:00 ${amPm}`;
}

function toSoftTint(hexColor: string, alpha = 0.18): string {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
  if (!match) return "rgba(224, 214, 200, 0.7)";
  const [, r, g, b] = match;
  return `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${alpha})`;
}

export function WallpaperTable({ entries, colorOverrides }: WallpaperTableProps) {
  const { settings } = useWallpaper();

  const tableBlocks = useMemo(() => {
    const startMinutes = START_HOUR * 60;
    const endMinutes = END_HOUR * 60;
    const totalMinutes = endMinutes - startMinutes;

    return entries
      .map((entry) => {
        const dayIndex = getDayIndex(entry.day || "");
        if (dayIndex < 0) return null;

        const start = timeToMinutes(entry.start || "00:00");
        const end = timeToMinutes(entry.end || "00:00");
        const clippedStart = Math.max(start, startMinutes);
        const clippedEnd = Math.min(end, endMinutes);

        if (clippedEnd <= clippedStart) return null;

        const top = ((clippedStart - startMinutes) / totalMinutes) * 100;
        const height = ((clippedEnd - clippedStart) / totalMinutes) * 100;
        const colorKey = entry.subjectKey || entry.course || "DEFAULT";
        const borderColor = colorOverrides[colorKey] || "#1f2937";
        const courseCode = entry.course || entry.subjectKey || entry.section || "CLASS";

        return {
          id: `${entry.day}-${entry.start}-${entry.end}-${courseCode}`,
          dayIndex,
          top,
          height,
          courseCode,
          start: entry.start,
          end: entry.end,
          borderColor,
        };
      })
      .filter((block): block is NonNullable<typeof block> => block !== null);
  }, [entries, colorOverrides]);

  return (
    <div className="w-full h-full px-5 pb-6 pt-6">
      <div
        className="w-[92%] h-[88%] mx-auto mt-[6%] rounded-[16px] border border-[#2f2a24] overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.02)]"
        style={{ backgroundColor: "#d7d2c4", color: "#111111" }}
      >
        <div className="h-8 border-b border-[#2f2a24] flex items-center justify-center text-[12px] font-semibold tracking-wide">
          {settings.titleText || "Untitled"}
        </div>

        <div className="grid grid-cols-[54px_repeat(5,minmax(0,1fr))] h-[calc(100%-32px)] text-[11px]">
          <div className="border-r border-[#2f2a24]" />
          {DAYS.map((day) => (
            <div
              key={day}
              className="border-r last:border-r-0 border-[#2f2a24] border-b flex items-center justify-center font-semibold pt-0.5"
            >
              {day}
            </div>
          ))}

          <div className="col-span-6 grid grid-cols-[54px_repeat(5,minmax(0,1fr))] h-[calc(100%-26px)]">
            <div className="border-r border-[#2f2a24]">
              {Array.from({ length: TOTAL_HOURS }).map((_, index) => {
                const hour = START_HOUR + index;
                const [mainTime, ampm] = formatHourLabel(hour).split(" ");
                return (
                  <div
                    key={hour}
                    className="border-b border-[#2f2a24] flex flex-col items-center justify-center text-center px-1"
                    style={{ height: `${ROW_HEIGHT_PERCENT}%` }}
                  >
                    <span className="text-[9px] font-medium leading-tight">{mainTime}</span>
                    <span className="text-[8.5px] font-medium leading-tight mt-px">{ampm}</span>
                  </div>
                );
              })}
            </div>

            {DAYS.map((day, dayIndex) => (
              <div key={day} className="relative border-r last:border-r-0 border-[#2f2a24]">
                {Array.from({ length: TOTAL_HOURS }).map((_, index) => (
                  <div
                    key={index}
                    className="border-b border-[#2f2a24]"
                    style={{ height: `${ROW_HEIGHT_PERCENT}%` }}
                  />
                ))}

                {tableBlocks
                  .filter((block) => block.dayIndex === dayIndex)
                  .map((block) => (
                    <div
                      key={block.id}
                      className="absolute left-[4px] right-[4px] rounded-[9px] border-[1.5px] px-1 py-1 flex flex-col items-center justify-center text-center"
                      style={{
                        top: `${block.top}%`,
                        height: `max(${block.height}%, 38px)`,
                        borderColor: block.borderColor,
                        backgroundColor: toSoftTint(block.borderColor),
                      }}
                    >
                      <div className="text-[10px] leading-tight font-semibold">{block.courseCode}</div>
                      {settings.showTime && (
                        <div className="text-[9px] leading-tight mt-0.5">
                          {block.start} - {block.end}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
