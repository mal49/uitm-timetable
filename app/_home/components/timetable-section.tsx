"use client";

import { useEffect, useState, type CSSProperties } from "react";
import {
  CalendarDays,
  CalendarX2,
  Clock,
  Coffee,
  ImageDown,
  List,
  Loader2,
  MapPin,
  Palette,
  User,
  Users,
  X,
} from "lucide-react";
import type { HomePageState } from "@/app/_home/use-home-page";
import { displayName, minutesToLabel, timeToMinutes } from "@/app/_home/utils";
import { Segmented } from "@/components/ui/segmented";
import type { TimetableEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOUR_PX = 68;

/** Subject colour readable as text in both themes (see --subject-ink). */
const ink = (color: string) => `color-mix(in oklab, ${color} var(--subject-ink), var(--foreground))`;

function weekDates() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return DAYS.map((_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

function timeRange(entry: TimetableEntry) {
  return `${minutesToLabel(timeToMinutes(entry.start))} – ${minutesToLabel(timeToMinutes(entry.end))}`;
}

/** Side-by-side lanes so overlapping (clashing) classes stay readable. */
function assignLanes(entries: TimetableEntry[]) {
  const laneEnds: number[] = [];
  const placed = [...entries]
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
    .map((entry) => {
      let lane = laneEnds.findIndex((end) => end <= timeToMinutes(entry.start));
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = timeToMinutes(entry.end);
      return { entry, lane };
    });
  return { placed, lanes: Math.max(1, laneEnds.length) };
}

export function CanvasStep({ home }: { home: HomePageState }) {
  const [selected, setSelected] = useState<TimetableEntry | null>(null);
  const { timetableRef, combinedEntries: entries, subjectColors } = home;
  const dates = weekDates();
  const todayIndex = (new Date().getDay() + 6) % 7;
  const dayCount = entries.some((entry) => entry.day === "Sunday") ? 7 : 6;
  const days = DAYS.slice(0, dayCount);
  const last = dates[dayCount - 1]!;
  const rangeLabel = `${dates[0]!.getDate()}–${last.getDate()} ${last.toLocaleString("en-GB", { month: "short" })}`;

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <section aria-labelledby="canvas-title" className="mx-auto max-w-[1440px] px-4 py-6 lg:px-8 lg:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="canvas-title" className="text-2xl font-bold tracking-[-0.01em]">Class canvas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {entries.length} session{entries.length === 1 ? "" : "s"} this week · {rangeLabel}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Segmented
            label="Canvas view"
            value={home.viewMode}
            onChange={home.setViewMode}
            options={[
              { value: "grid", label: <><CalendarDays aria-hidden="true" />Week</> },
              { value: "table", label: <><List aria-hidden="true" />List</> },
            ]}
          />
          <button
            type="button"
            onClick={home.exportTimetable}
            disabled={home.exporting || entries.length === 0}
            className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-surface-3 px-4 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            {home.exporting ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <ImageDown aria-hidden="true" className="size-4" />}
            Export JPG
          </button>
        </div>
      </div>
      {home.exportError ? <p role="alert" className="mt-2 text-sm text-destructive">{home.exportError}</p> : null}

      {entries.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-[20px] border border-border bg-card px-6 py-16 text-center">
          <CalendarX2 aria-hidden="true" className="size-8 text-faint" />
          <p className="mt-3 font-semibold">Nothing on your canvas yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Pick a group for each subject to see your week.</p>
        </div>
      ) : (
        <div ref={timetableRef} className="mt-6 bg-background">
          {home.viewMode === "grid" ? (
            <WeekGrid
              days={days}
              dates={dates}
              todayIndex={todayIndex}
              entries={entries}
              colors={subjectColors}
              selected={selected}
              onSelect={setSelected}
              onEditSubject={(course) => home.focusSubject(course)}
            />
          ) : (
            <DayList days={days} todayIndex={todayIndex} entries={entries} colors={subjectColors} />
          )}
        </div>
      )}
    </section>
  );
}

type WeekGridProps = {
  days: string[];
  dates: Date[];
  todayIndex: number;
  entries: TimetableEntry[];
  colors: Record<string, string>;
  selected: TimetableEntry | null;
  onSelect: (entry: TimetableEntry | null) => void;
  onEditSubject: (course: string) => void;
};

function WeekGrid({ days, dates, todayIndex, entries, colors, selected, onSelect, onEditSubject }: WeekGridProps) {
  const startHour = Math.min(8, ...entries.map((entry) => Math.floor(timeToMinutes(entry.start) / 60)));
  const endHour = Math.max(17, ...entries.map((entry) => Math.ceil(timeToMinutes(entry.end) / 60)));
  const hours = Array.from({ length: endHour - startHour }, (_, index) => startHour + index);
  const columns: CSSProperties = { gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))` };

  return (
    <div className="overflow-x-auto rounded-[20px] border border-border bg-card lg:overflow-visible">
      <div className="min-w-[860px]">
        <div className="grid h-11 border-b border-border" style={columns}>
          <span />
          {days.map((day, index) => (
            <div key={day} className="flex items-center gap-3 border-l border-border px-3">
              <span className={cn("text-[11px] font-medium tracking-[0.08em] uppercase", index === todayIndex ? "text-primary-soft-foreground" : "text-faint")}>
                {day.slice(0, 3)}
              </span>
              <span className={cn("text-[13px] font-medium", index === todayIndex && "flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground")}>
                {dates[index]!.getDate()}
              </span>
            </div>
          ))}
        </div>
        <div className="grid" style={columns} onClick={() => onSelect(null)}>
          <div>
            {hours.map((hour) => (
              <div key={hour} className="border-b border-border px-3 pt-1.5 text-right text-[11px] text-faint" style={{ height: HOUR_PX }}>
                {hour}:00
              </div>
            ))}
          </div>
          {days.map((day, dayIndex) => {
            const { placed, lanes } = assignLanes(entries.filter((entry) => entry.day === day));
            return (
              <div key={day} className="relative border-l border-border">
                {hours.map((hour) => (
                  <div key={hour} className="border-b border-border" style={{ height: HOUR_PX }} />
                ))}
                {placed.map(({ entry, lane }) => {
                  const color = colors[entry.course ?? ""] ?? "#b9a3f0";
                  const start = timeToMinutes(entry.start);
                  const top = ((start - startHour * 60) / 60) * HOUR_PX + 2;
                  const height = ((timeToMinutes(entry.end) - start) / 60) * HOUR_PX - 4;
                  const isSelected = selected === entry;
                  return (
                    <div key={`${entry.section}-${entry.start}`} className="absolute" style={{ top, height, left: `calc(${(lane / lanes) * 100}% + 4px)`, width: `calc(${100 / lanes}% - 8px)` }}>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelect(isSelected ? null : entry);
                        }}
                        aria-expanded={isSelected}
                        className="h-full w-full overflow-hidden rounded-lg border-l-2 px-2.5 py-2 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        style={{
                          background: `color-mix(in oklab, ${color} 22%, var(--card))`,
                          borderColor: color,
                          boxShadow: isSelected ? `inset 0 0 0 2px ${color}` : undefined,
                        }}
                      >
                        <span className="block truncate text-[13px] font-semibold" style={{ color: ink(color) }}>{entry.course}</span>
                        <span className="block truncate text-xs">{displayName(entry.subjectName ?? "")}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {minutesToLabel(start)}–{minutesToLabel(timeToMinutes(entry.end))}
                          {entry.venue ? ` · ${entry.venue}` : ""}
                        </span>
                      </button>
                      {isSelected ? (
                        <ClassPopover entry={entry} side={dayIndex >= 4 ? "left" : "right"} onClose={() => onSelect(null)} onEditSubject={onEditSubject} />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ClassPopover({
  entry,
  side,
  onClose,
  onEditSubject,
}: {
  entry: TimetableEntry;
  side: "left" | "right";
  onClose: () => void;
  onEditSubject: (course: string) => void;
}) {
  const minutes = timeToMinutes(entry.end) - timeToMinutes(entry.start);
  const group = entry.section.replace(entry.course ?? "", "").trim();
  const rows = [
    [Clock, `${timeRange(entry)} · ${minutes / 60} hour${minutes === 60 ? "" : "s"}`],
    entry.venue ? [MapPin, entry.venue] : null,
    group ? [Users, `Group ${group}`] : null,
    entry.lecturer ? [User, entry.lecturer] : null,
  ].filter(Boolean) as [typeof Clock, string][];

  return (
    <div
      role="dialog"
      aria-label={`${entry.course} details`}
      onClick={(event) => event.stopPropagation()}
      className={cn(
        "absolute top-0 z-30 w-[300px] rounded-2xl border border-border bg-card p-4 shadow-[0_16px_40px_#00000059]",
        side === "right" ? "left-[calc(100%+8px)]" : "right-[calc(100%+8px)]",
      )}
    >
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary-soft-foreground">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
          {entry.day}
        </span>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
      <p className="mt-3 text-xl font-bold">{entry.course}</p>
      <p className="text-sm text-muted-foreground">{displayName(entry.subjectName ?? "")}</p>
      <ul className="mt-4 space-y-2.5">
        {rows.map(([Icon, text]) => (
          <li key={text} className="flex items-center gap-2.5 text-sm">
            <Icon aria-hidden="true" className="size-4 shrink-0 text-faint" />
            {text}
          </li>
        ))}
      </ul>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => onEditSubject(entry.course ?? "")} className="h-9 rounded-lg bg-surface-3 text-sm hover:opacity-90">
          Change group
        </button>
        <button type="button" onClick={() => onEditSubject(entry.course ?? "")} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-surface-3 text-sm hover:opacity-90">
          <Palette aria-hidden="true" className="size-4" />
          Colour
        </button>
      </div>
    </div>
  );
}

function DayList({ days, todayIndex, entries, colors }: { days: string[]; todayIndex: number; entries: TimetableEntry[]; colors: Record<string, string> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-flow-col xl:auto-cols-fr xl:grid-cols-none">
      {days.map((day, index) => {
        const dayEntries = entries
          .filter((entry) => entry.day === day)
          .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
        return (
          <section key={day} aria-label={day} className={cn("flex min-h-[300px] flex-col rounded-[20px] border bg-card p-3.5 xl:min-h-[690px]", index === todayIndex ? "border-primary" : "border-border")}>
            <header className="flex items-baseline justify-between px-0.5 pb-3">
              <h2 className="text-[15px] font-semibold">{day.slice(0, 3)}</h2>
              <span className="text-xs text-faint">
                {dayEntries.length ? `${dayEntries.length} class${dayEntries.length === 1 ? "" : "es"}` : "Free"}
              </span>
            </header>
            {dayEntries.length ? (
              <ul className="space-y-2.5">
                {dayEntries.map((entry) => {
                  const color = colors[entry.course ?? ""] ?? "#b9a3f0";
                  return (
                    <li key={`${entry.section}-${entry.start}`} className="rounded-xl p-3" style={{ background: `color-mix(in oklab, ${color} 16%, var(--card))` }}>
                      <p className="flex items-center gap-1.5 text-xs" style={{ color: ink(color) }}>
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                        {timeRange(entry)}
                      </p>
                      <p className="mt-1 text-sm font-semibold">{entry.course}</p>
                      <p className="truncate text-xs text-muted-foreground">{displayName(entry.subjectName ?? "")}</p>
                      {entry.venue ? (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-faint">
                          <MapPin aria-hidden="true" className="size-3" />
                          {entry.venue}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-border text-sm text-faint">
                <Coffee aria-hidden="true" className="mb-2 size-4" />
                No classes
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
