import type { TimetableEntry } from "@/lib/types";

export type WeekClass = {
  key: string;
  code: string;
  name: string;
  room: string;
  start: number; // minutes from midnight
  end: number;
  color: string;
};

export type WeekDay = { index: number; classes: WeekClass[] };

export type Week = {
  days: WeekDay[]; // Mon–Fri plus any weekend day that has classes, Monday first
  startHour: number;
  endHour: number;
  classCount: number;
  subjects: WeekClass[]; // first class of each subject, in week order
  freeDays: number[]; // day indexes (0 = Sunday) with no classes, Monday first
};

const ORDER = [1, 2, 3, 4, 5, 6, 0];
export const DAY_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export const DAY_TITLE = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const HARI_SHORT = ["AHD", "ISN", "SEL", "RAB", "KHA", "JUM", "SAB"];
export const HARI_LONG = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];

function dayIndex(day: string): number {
  const prefix = day.trim().slice(0, 3).toLowerCase();
  return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(prefix);
}

function toMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return (hour || 0) * 60 + (minute || 0);
}

export function buildWeek(entries: TimetableEntry[], colors: Record<string, string>): Week {
  const byDay = new Map<number, WeekClass[]>();

  for (const entry of entries) {
    const index = dayIndex(entry.day || "");
    if (index < 0 || !entry.start || !entry.end) continue;
    const key = entry.subjectKey || entry.course || entry.section;
    const item: WeekClass = {
      key,
      code: (entry.course || key).replace(/\s+/g, ""),
      name: entry.subjectName || "",
      room: (entry.venue || "").trim().replace(/\s+/g, " "),
      start: toMinutes(entry.start),
      end: toMinutes(entry.end),
      color: colors[key] || "#B9A3F0",
    };
    byDay.set(index, [...(byDay.get(index) ?? []), item]);
  }

  const days = ORDER.filter((index) => (index >= 1 && index <= 5) || byDay.has(index)).map((index) => ({
    index,
    classes: (byDay.get(index) ?? []).sort((a, b) => a.start - b.start),
  }));
  const all = days.flatMap((day) => day.classes);
  const startHour = all.length ? Math.floor(Math.min(...all.map((c) => c.start)) / 60) : 8;
  const endHour = all.length ? Math.ceil(Math.max(...all.map((c) => c.end)) / 60) : 17;
  const subjects = [...new Map(all.map((c) => [c.key, c])).values()];

  return {
    days,
    startHour,
    endHour: Math.max(endHour, startHour + 4),
    classCount: all.length,
    subjects,
    freeDays: ORDER.filter((index) => !byDay.has(index)),
  };
}

/** 12-hour clock without am/pm, e.g. 8, 10:30, 2. */
export function hourLabel(minutes: number): string {
  const hour = Math.floor(minutes / 60) % 12 || 12;
  const minute = minutes % 60;
  return minute ? `${hour}:${String(minute).padStart(2, "0")}` : String(hour);
}

export function timeRange(item: WeekClass): string {
  return `${hourLabel(item.start)}–${hourLabel(item.end)}`;
}

/** Joins names as "A", "A & B", "A, B & C". */
export function joinNames(names: string[]): string {
  return names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`;
}

/** UiTM academic sessions run October → August, e.g. [2025, 2026]. */
export function academicSession(date = new Date()): [number, number] {
  const year = date.getFullYear();
  return date.getMonth() >= 9 ? [year, year + 1] : [year - 1, year];
}

/** Malay clock label for the Heritage footers, e.g. "8 PAGI", "4 PETANG". */
export function malayHour(hour: number): string {
  const period = hour < 12 ? "PAGI" : hour < 14 ? "TENGAH HARI" : hour < 19 ? "PETANG" : "MALAM";
  return `${hour % 12 || 12} ${period}`;
}

export function darken(hex: string, amount: number): string {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  const channel = (shift: number) => Math.round(((value >> shift) & 255) * (1 - amount));
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

export function isDark(hex: string): boolean {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return (((value >> 16) & 255) * 299 + ((value >> 8) & 255) * 587 + (value & 255) * 114) / 1000 < 140;
}
