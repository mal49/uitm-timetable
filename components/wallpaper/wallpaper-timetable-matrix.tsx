"use client";

import { useMemo } from "react";

import { getSubjectColor, WEEKDAYS } from "@/lib/constants";
import type { TimetableEntry } from "@/lib/types";

type MatrixGranularity = 30 | 60;

export interface WallpaperTimetableMatrixProps {
  entries: TimetableEntry[];
  course: string;
  colorOverrides?: Record<string, string>;
  showVenue?: boolean;
  showLecturer?: boolean;
  showTime?: boolean;
  granularityMinutes?: MatrixGranularity;
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function minutesToLabel(mins: number) {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const isPm = h24 >= 12;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const suffix = isPm ? "PM" : "AM";
  return `${h12}:${pad2(m)} ${suffix}`;
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

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const DAY_NAMES_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

function normalizeDay(d: string): (typeof DAY_ORDER)[number] | null {
  const raw = d.trim().toLowerCase();
  if (raw.startsWith("mon")) return "Mon";
  if (raw.startsWith("tue")) return "Tue";
  if (raw.startsWith("wed")) return "Wed";
  if (raw.startsWith("thu")) return "Thu";
  if (raw.startsWith("fri")) return "Fri";
  return null;
}

export function WallpaperTimetableMatrix({
  entries,
  course,
  colorOverrides,
  showVenue = true,
  showLecturer = false,
  showTime = true,
  granularityMinutes = 60,
}: WallpaperTimetableMatrixProps) {
  const normalized = useMemo(() => {
    return entries
      .map((e) => {
        const day = normalizeDay(e.day) ?? null;
        if (!day) return null;
        const startMin = timeToMinutes(e.start);
        const endMin = timeToMinutes(e.end);
        if (!Number.isFinite(startMin) || !Number.isFinite(endMin) || endMin <= startMin) return null;
        return { ...e, day, startMin, endMin };
      })
      .filter(Boolean) as Array<
      TimetableEntry & { day: (typeof DAY_ORDER)[number]; startMin: number; endMin: number }
    >;
  }, [entries]);

  const timeRange = useMemo(() => {
    // More generous time range for visibility
    const DEFAULT_START = 8 * 60;
    const DEFAULT_END = 17 * 60;

    if (normalized.length === 0) {
      return { startMin: DEFAULT_START, endMin: DEFAULT_END };
    }

    const minStart = Math.min(...normalized.map((e) => e.startMin));
    const maxEnd = Math.max(...normalized.map((e) => e.endMin));

    const startHour = Math.floor(minStart / 60);
    const endHour = Math.ceil(maxEnd / 60);

    return {
      startMin: clamp(startHour * 60, 7 * 60, 12 * 60),
      endMin: clamp(endHour * 60, 14 * 60, 20 * 60),
    };
  }, [normalized]);

  const columnEntries = useMemo(() => {
    const byDay = new Map<(typeof DAY_ORDER)[number], typeof normalized>();
    for (const d of DAY_ORDER) byDay.set(d, []);
    for (const e of normalized) byDay.get(e.day)?.push(e);
    for (const d of DAY_ORDER) {
      byDay.set(
        d,
        (byDay.get(d) ?? []).slice().sort((a, b) => a.startMin - b.startMin)
      );
    }
    return byDay;
  }, [normalized]);

  const dayCols = DAY_ORDER;

  // Card-slot schedule layout (like reference image)
  // Generate hour slots from time range
  const hourSlots = useMemo(() => {
    const slots: { label: string; hour: number }[] = [];
    const startHour = Math.floor(timeRange.startMin / 60);
    const endHour = Math.ceil(timeRange.endMin / 60);
    
    for (let h = startHour; h <= endHour; h++) {
      const isPm = h >= 12;
      const h12 = h % 12 === 0 ? 12 : h % 12;
      slots.push({
        label: `${h12} ${isPm ? "PM" : "AM"}`,
        hour: h,
      });
    }
    return slots;
  }, [timeRange]);

  // Map entries to hour slots
  const slotEntries = useMemo(() => {
    const map = new Map<string, TimetableEntry>();
    for (const e of normalized) {
      const startHour = Math.floor(e.startMin / 60);
      const key = `${e.day}-${startHour}`;
      map.set(key, e);
    }
    return map;
  }, [normalized]);

  return (
    <div className="w-full h-full flex flex-col" style={{ padding: "8px" }}>
      {/* Header row */}
      <div className="flex gap-2 mb-2">
        {/* Hour label column header */}
        <div
          style={{
            width: "56px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #3d4f7d 0%, #2d3b5c 100%)",
            borderRadius: 8,
            fontSize: 10,
            fontWeight: 800,
            color: "white",
            textTransform: "uppercase",
            letterSpacing: "0.03em",
          }}
        >
          Hour
        </div>
        
        {/* Day headers */}
        {dayCols.map((day) => (
          <div
            key={day}
            style={{
              flex: 1,
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #3d4f7d 0%, #2d3b5c 100%)",
              borderRadius: 8,
              fontSize: 10.5,
              fontWeight: 800,
              color: "white",
              letterSpacing: "0.02em",
            }}
          >
            {day === "Mon" ? "Monday" : 
             day === "Tue" ? "Tuesday" :
             day === "Wed" ? "Wednesday" :
             day === "Thu" ? "Thursday" :
             day === "Fri" ? "Friday" : day}
          </div>
        ))}
      </div>

      {/* Schedule grid */}
      <div className="flex-1 overflow-auto" style={{ minHeight: 0 }}>
        <div className="flex flex-col gap-2">
          {hourSlots.map((slot) => (
            <div key={slot.hour} className="flex gap-2">
              {/* Hour label */}
              <div
                style={{
                  width: "56px",
                  minHeight: "52px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(15, 23, 42, 0.68)",
                }}
              >
                {slot.label}
              </div>

              {/* Day slots */}
              {dayCols.map((day) => {
                const key = `${day}-${slot.hour}`;
                const entry = slotEntries.get(key);

                if (!entry) {
                  // Empty slot
                  return (
                    <div
                      key={key}
                      style={{
                        flex: 1,
                        minHeight: "52px",
                        background: "rgba(195, 201, 223, 0.35)",
                        borderRadius: 8,
                        border: "1px solid rgba(195, 201, 223, 0.45)",
                      }}
                    />
                  );
                }

                // Filled slot with class
                const colorKey = entry.subjectKey || entry.course || entry.section || course || "SUBJECT";
                const overrideHex = colorOverrides?.[colorKey];
                const rgb = overrideHex ? hexToRgb(overrideHex) : null;

                const bgColor = entry.isClash
                  ? "rgba(239, 68, 68, 0.22)"
                  : rgb
                    ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`
                    : "rgba(99, 102, 241, 0.22)";

                const borderColor = entry.isClash
                  ? "rgba(239, 68, 68, 0.85)"
                  : rgb
                    ? overrideHex
                    : "rgba(99, 102, 241, 0.85)";

                const textColor = entry.isClash
                  ? "rgba(153, 27, 27, 0.95)"
                  : rgb
                    ? overrideHex
                    : "rgba(55, 48, 163, 0.98)";

                const title = (entry.course || entry.subjectKey || course || "SUBJECT").trim();
                const subtitle = entry.section
                  ? entry.section.replace(title, "").trim() || entry.section
                  : "";

                return (
                  <div
                    key={key}
                    style={{
                      flex: 1,
                      minHeight: "52px",
                      background: bgColor,
                      borderRadius: 8,
                      border: `2px solid ${borderColor}`,
                      padding: "7px 9px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      gap: "2px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        color: textColor,
                        lineHeight: 1.25,
                      }}
                    >
                      {title}
                    </div>
                    {subtitle && (
                      <div
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          color: "rgba(15, 23, 42, 0.75)",
                          lineHeight: 1.25,
                        }}
                      >
                        {subtitle}
                      </div>
                    )}
                    {showTime && (
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: "rgba(15, 23, 42, 0.65)",
                          lineHeight: 1.25,
                        }}
                        className="tabular-nums"
                      >
                        {entry.start}–{entry.end}
                      </div>
                    )}
                    {showVenue && (
                      <div
                        style={{
                          fontSize: 8.5,
                          fontWeight: 650,
                          color: "rgba(15, 23, 42, 0.62)",
                          lineHeight: 1.25,
                        }}
                      >
                        📍 {entry.venue}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

