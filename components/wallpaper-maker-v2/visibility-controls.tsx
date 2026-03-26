"use client";

import { useWallpaper } from "./wallpaper-context";

type VisibilityKey =
  | "showCourseCode"
  | "showCourseName"
  | "showTime"
  | "showVenue"
  | "showLecturer"
  | "showDayLabels"
  | "showTimeIndicators";

const visibilityItems: Array<{ key: VisibilityKey; label: string }> = [
  { key: "showCourseCode", label: "Course Code" },
  { key: "showCourseName", label: "Course Name" },
  { key: "showTime", label: "Time" },
  { key: "showVenue", label: "Venue" },
  { key: "showLecturer", label: "Lecturer" },
  { key: "showDayLabels", label: "Day Labels" },
  { key: "showTimeIndicators", label: "Time Indicators" },
];

export function VisibilityControls() {
  const { settings, updateSettings } = useWallpaper();

  return (
    <div className="space-y-1.5 pt-2 pb-1">
      {visibilityItems.map(({ key, label }) => (
        <label key={key} className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            {label}
          </span>
          <input
            type="checkbox"
            checked={settings[key]}
            onChange={(e) => updateSettings({ [key]: e.target.checked })}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
        </label>
      ))}
    </div>
  );
}
