"use client";

import {
  BookOpenText,
  CalendarDays,
  CalendarRange,
  Clock3,
  Eye,
  MapPin,
  User,
} from "lucide-react";
import { useWallpaper } from "./wallpaper-context";
import { cn } from "@/lib/utils";

type VisibilityKey =
  | "showCourseCode"
  | "showTime"
  | "showVenue"
  | "showLecturer"
  | "showDayLabels"
  | "showWidgetPosition"
  | "showTimeIndicators";

const visibilityItems: Array<{
  key: VisibilityKey;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: "showCourseCode",
    label: "Course Code",
    description: "Show subject code on cards.",
    icon: BookOpenText,
  },
  {
    key: "showTime",
    label: "Time",
    description: "Show class time on cards.",
    icon: Clock3,
  },
  {
    key: "showVenue",
    label: "Venue",
    description: "Show room or online venue.",
    icon: MapPin,
  },
  {
    key: "showLecturer",
    label: "Lecturer",
    description: "Show lecturer name on cards.",
    icon: User,
  },
  {
    key: "showDayLabels",
    label: "Day Labels",
    description: "Show weekday headers.",
    icon: CalendarRange,
  },
  {
    key: "showWidgetPosition",
    label: "Widget Position",
    description: "Keep the lock screen widget marker visible.",
    icon: CalendarDays,
  },
  {
    key: "showTimeIndicators",
    label: "Time Indicators",
    description: "Show left-side hour markers.",
    icon: Eye,
  },
];

export function VisibilityControls() {
  const { settings, updateSettings } = useWallpaper();

  return (
    <div className="grid grid-cols-2 gap-2.5 pt-2 pb-1">
      {visibilityItems.map(({ key, label, description, icon: Icon }) => {
        const checked = Boolean(settings[key]);

        return (
          <label
            key={key}
            className={cn(
              "group flex min-w-0 cursor-pointer flex-col rounded-xl border px-3 py-3 transition-all",
              checked
                ? "border-[#21d4cf]/45 bg-[#21d4cf]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                : "border-border/70 bg-muted/[0.18] hover:border-border hover:bg-muted/[0.28]"
            )}
          >
            <div className="flex w-full items-start justify-between gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
                  checked
                    ? "border-[#21d4cf]/40 bg-[#21d4cf]/12 text-[#0f766e]"
                    : "border-slate-200 bg-white text-slate-500 group-hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              <span
                className={cn(
                  "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors",
                  checked
                    ? "border-[#21d4cf]/60 bg-[#21d4cf]"
                    : "border-border bg-background/80"
                )}
              >
                <span
                  className={cn(
                    "ml-0.5 block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform",
                    checked ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </span>
            </div>

            <div className="mt-2 min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[14px] font-semibold leading-tight text-foreground">{label}</span>
                {checked ? (
                  <span className="rounded-full bg-[#21d4cf]/12 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#0f766e]">
                    On
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[11px] leading-4 text-slate-600">{description}</p>
            </div>

            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => updateSettings({ [key]: e.target.checked })}
              className="sr-only"
            />
          </label>
        );
      })}
    </div>
  );
}
