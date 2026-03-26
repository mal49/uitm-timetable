"use client";

import { MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSubjectColor, DAYS_OF_WEEK } from "@/lib/constants";
import type { TimetableEntry } from "@/lib/types";

interface TimetableTableProps {
  entries: TimetableEntry[];
  course: string;
  colorOverrides?: Record<string, string>;
  variant?: "desktop" | "wallpaper";
  showTime?: boolean;
  showVenue?: boolean;
  showLecturer?: boolean;
  showIcons?: boolean;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  const int = Number.parseInt(normalized, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function TimetableTable({
  entries,
  course,
  colorOverrides,
  variant = "desktop",
  showTime = true,
  showVenue = true,
  showLecturer = true,
  showIcons = true,
}: TimetableTableProps) {
  const isWallpaper = variant === "wallpaper";
  const sorted = [...entries].sort((a, b) => {
    const dayOrder =
      DAYS_OF_WEEK.indexOf(a.day as (typeof DAYS_OF_WEEK)[number]) -
      DAYS_OF_WEEK.indexOf(b.day as (typeof DAYS_OF_WEEK)[number]);
    if (dayOrder !== 0) return dayOrder;
    return timeToMinutes(a.start) - timeToMinutes(b.start);
  });

  if (sorted.length === 0) {
    return (
      <p
        className={`text-center py-8 ${isWallpaper ? "text-white/70" : "text-muted-foreground"}`}
      >
        No entries to display.
      </p>
    );
  }

  return (
    <div
      className={`overflow-hidden ${
        isWallpaper ? "bg-transparent border-0 rounded-[28px]" : "rounded-xl border border-border"
      }`}
    >
      <div className="overflow-x-auto">
        <table className={`w-full ${isWallpaper ? "text-[12px]" : "text-sm"}`}>
          <thead>
            <tr
              className={`${
                isWallpaper ? "bg-black/10" : "bg-muted/60 border-b border-border"
              } ${isWallpaper ? "" : "border-b border-border"}`}
            >
              <th className={`px-4 py-3 text-left ${isWallpaper ? "text-white/85" : "text-muted-foreground"} font-semibold`}>
                Day
              </th>
              {showTime ? (
                <th className={`px-4 py-3 text-left ${isWallpaper ? "text-white/85" : "text-muted-foreground"} font-semibold`}>
                  Time
                </th>
              ) : null}
              <th className={`px-4 py-3 text-left ${isWallpaper ? "text-white/85" : "text-muted-foreground"} font-semibold`}>
                Section
              </th>
              {showVenue ? (
                <th className={`px-4 py-3 text-left ${isWallpaper ? "text-white/85" : "text-muted-foreground"} font-semibold`}>
                  Venue
                </th>
              ) : null}
              {showLecturer ? (
                <th className={`px-4 py-3 text-left ${isWallpaper ? "text-white/85" : "text-muted-foreground"} font-semibold`}>
                  Lecturer
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, idx) => {
              const colorKey = entry.subjectKey || entry.course || entry.section || course;
              const overrideHex = colorOverrides?.[colorKey];
              const rgb = overrideHex ? hexToRgb(overrideHex) : null;
              const color = getSubjectColor(colorKey);
              return (
                <tr
                  key={`${entry.day}-${entry.start}-${entry.section}-${idx}`}
                  className={`${
                    isWallpaper ? "border-white/10" : "border-border"
                  } border-b last:border-b-0 ${isWallpaper ? "" : "transition-colors hover:bg-muted/30"} ${
                    entry.isClash ? "bg-destructive/5" : ""
                  }`}
                >
                  <td
                    className={`px-4 py-3 font-medium whitespace-nowrap ${
                      isWallpaper ? "text-white/90" : "text-foreground"
                    }`}
                  >
                    {entry.day}
                  </td>
                  {showTime ? (
                    <td
                      className={`px-4 py-3 font-mono text-sm whitespace-nowrap ${
                        isWallpaper ? "text-white/90" : "text-foreground"
                      }`}
                    >
                      {entry.start} – {entry.end}
                    </td>
                  ) : null}
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`font-mono text-xs ${
                        entry.isClash
                          ? "bg-destructive/10 border-destructive/50 text-destructive"
                          : rgb
                            ? ""
                            : `${color.bg} ${color.border} ${color.text}`
                      }`}
                      style={
                        !entry.isClash && rgb
                          ? {
                              backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`,
                              borderColor: overrideHex,
                              color: overrideHex,
                            }
                          : undefined
                      }
                    >
                      {entry.section || "—"}
                    </Badge>
                  </td>
                  {showVenue ? (
                    <td className="px-4 py-3">
                      <span
                        className={`flex items-center gap-1.5 truncate ${
                          isWallpaper ? "text-white/80" : "text-muted-foreground"
                        }`}
                      >
                        {showIcons ? <MapPin className="h-3.5 w-3.5 shrink-0" /> : null}
                        {entry.venue}
                      </span>
                    </td>
                  ) : null}
                  {showLecturer ? (
                    <td className="px-4 py-3">
                      {entry.lecturer ? (
                        <span
                          className={`flex items-center gap-1.5 truncate ${
                            isWallpaper ? "text-white/80" : "text-muted-foreground"
                          }`}
                        >
                          {showIcons ? <User className="h-3.5 w-3.5 shrink-0" /> : null}
                          {entry.lecturer}
                        </span>
                      ) : (
                        <span className={`${isWallpaper ? "text-white/50" : "text-muted-foreground/50"}`}>—</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
