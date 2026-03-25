"use client";

import { useRef, useEffect, useState } from "react";
import { AlertTriangle, MapPin, User, Clock, ChevronDown, Filter, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSubjectColor, WEEKDAYS, HOUR_START, HOUR_END } from "@/lib/constants";
import type { TimetableEntry } from "@/lib/types";

interface TimetableGridProps {
  entries: TimetableEntry[];
  course: string;
}

interface PlacedEntry extends TimetableEntry {
  startMinutes: number;
  durationMinutes: number;
  isClash: boolean;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function detectClashes(entries: TimetableEntry[]): Map<TimetableEntry, boolean> {
  const clashMap = new Map<TimetableEntry, boolean>();
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];
      if (!a || !b || a.day !== b.day) continue;
      const aStart = timeToMinutes(a.start);
      const aEnd = timeToMinutes(a.end);
      const bStart = timeToMinutes(b.start);
      const bEnd = timeToMinutes(b.end);
      if (aStart < bEnd && aEnd > bStart) {
        clashMap.set(a, true);
        clashMap.set(b, true);
      }
    }
  }
  return clashMap;
}

const TOTAL_HOURS = HOUR_END - HOUR_START;
const TOTAL_MINUTES = TOTAL_HOURS * 60;

const HOUR_LABELS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => {
  const h = HOUR_START + i;
  return `${String(h).padStart(2, "0")}:00`;
});

export function TimetableGrid({ entries, course }: TimetableGridProps) {
  const clashMap = detectClashes(entries);

  const activeDays = WEEKDAYS.filter((day) =>
    entries.some((e) => e.day === day)
  );
  const displayDays = activeDays.length > 0 ? activeDays : [...WEEKDAYS];

  const entriesByDay = new Map<string, PlacedEntry[]>();
  for (const day of displayDays) {
    const dayEntries = entries
      .filter((e) => e.day === day)
      .map((e) => ({
        ...e,
        startMinutes: timeToMinutes(e.start) - HOUR_START * 60,
        durationMinutes: timeToMinutes(e.end) - timeToMinutes(e.start),
        isClash: clashMap.has(e),
      }));
    entriesByDay.set(day, dayEntries);
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <div
        className="grid min-w-[640px]"
        style={{ gridTemplateColumns: `4rem repeat(${displayDays.length}, 1fr)` }}
      >
        {/* Header row */}
        <div className="sticky left-0 bg-card z-10 border-b border-r border-border" />
        {displayDays.map((day) => (
          <div
            key={day}
            className="bg-card border-b border-r border-border last:border-r-0 px-3 py-2.5 text-center"
          >
            <span className="text-sm font-semibold text-foreground">{day.slice(0, 3)}</span>
            <span className="hidden sm:inline text-sm font-semibold text-foreground">
              {day.slice(3)}
            </span>
          </div>
        ))}

        {/* Time column + day columns */}
        <div className="sticky left-0 bg-card z-10 border-r border-border">
          {HOUR_LABELS.map((label) => (
            <div
              key={label}
              className="h-14 border-b border-border last:border-b-0 flex items-start justify-end pr-2 pt-1"
            >
              <span className="text-[10px] text-muted-foreground font-mono">{label}</span>
            </div>
          ))}
        </div>

        {displayDays.map((day) => {
          const dayEntries = entriesByDay.get(day) ?? [];
          return (
            <div
              key={day}
              className="relative border-r border-border last:border-r-0"
              style={{ height: `${TOTAL_HOURS * 3.5}rem` }}
            >
              {/* Hour grid lines */}
              {HOUR_LABELS.map((label) => (
                <div
                  key={label}
                  className="absolute w-full border-b border-border/40"
                  style={{
                    top: `${(HOUR_LABELS.indexOf(label) / TOTAL_HOURS) * 100}%`,
                  }}
                />
              ))}

              {/* Class entries */}
              {dayEntries.map((entry, idx) => {
                const color = getSubjectColor(entry.section || course);
                const topPct = (entry.startMinutes / TOTAL_MINUTES) * 100;
                const heightPct = (entry.durationMinutes / TOTAL_MINUTES) * 100;

                return (
                  <div
                    key={`${entry.section}-${entry.start}-${idx}`}
                    className={`absolute left-1 right-1 rounded-md border px-2 py-1.5 overflow-hidden transition-shadow hover:shadow-md ${color.bg} ${color.border} ${color.text} ${
                      entry.isClash ? "ring-2 ring-destructive ring-offset-1" : ""
                    }`}
                    style={{
                      top: `${topPct}%`,
                      height: `${heightPct}%`,
                      minHeight: "2rem",
                    }}
                    title={`${course} ${entry.section} — ${entry.start}–${entry.end} @ ${entry.venue}`}
                  >
                    <p className="text-[11px] font-bold leading-tight truncate">
                      {course}
                      {entry.section ? ` · ${entry.section}` : ""}
                    </p>

                    {entry.durationMinutes >= 60 && (
                      <>
                        <p className="flex items-center gap-0.5 text-[10px] mt-0.5 opacity-80 truncate">
                          <Clock className="h-2.5 w-2.5 shrink-0" />
                          {entry.start}–{entry.end}
                        </p>
                        <p className="flex items-center gap-0.5 text-[10px] opacity-80 truncate">
                          <MapPin className="h-2.5 w-2.5 shrink-0" />
                          {entry.venue}
                        </p>
                        {entry.lecturer && (
                          <p className="flex items-center gap-0.5 text-[10px] opacity-70 truncate">
                            <User className="h-2.5 w-2.5 shrink-0" />
                            {entry.lecturer}
                          </p>
                        )}
                      </>
                    )}

                    {entry.isClash && (
                      <div className="absolute top-1 right-1">
                        <AlertTriangle className="h-3 w-3 text-destructive" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {clashMap.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-destructive/10 border-t border-border text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>{clashMap.size / 2} clash{clashMap.size / 2 !== 1 ? "es" : ""}</strong>{" "}
            detected — overlapping sessions are highlighted in red.
          </span>
        </div>
      )}
    </div>
  );
}

export function TimetableGridSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="grid grid-cols-6 border-b border-border">
        <div className="h-10 bg-muted" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted border-l border-border" />
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="grid grid-cols-6 border-b border-border last:border-b-0">
          <div className="h-14 bg-muted/50" />
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="h-14 bg-card border-l border-border">
              {Math.random() > 0.75 && (
                <div className="m-1 h-10 rounded bg-muted" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

interface TimetableLegendProps {
  entries: TimetableEntry[];
  course: string;
  selectedSections: Set<string>;
  onToggle: (section: string) => void;
  onClear: () => void;
  onSelectAll: () => void;
}

export function TimetableLegend({
  entries,
  course,
  selectedSections,
  onToggle,
  onClear,
  onSelectAll,
}: TimetableLegendProps) {
  const allSections = [...new Set(entries.map((e) => e.section).filter(Boolean))];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (allSections.length === 0) return null;

  const hasFilter = selectedSections.size > 0;
  const filtered = query.trim()
    ? allSections.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : allSections;

  return (
    <div className="flex items-center gap-3 flex-wrap" ref={containerRef}>
      {/* Filter button */}
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            hasFilter
              ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/15"
              : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          {hasFilter ? `${selectedSections.size} of ${allSections.length} groups` : "Filter groups"}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute left-0 top-full mt-1.5 z-30 w-72 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
            {/* Search */}
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search groups…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-b border-border px-3 py-1.5 bg-muted/40">
              <span className="text-xs text-muted-foreground">
                {hasFilter ? `${selectedSections.size} selected` : "All shown"}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={onSelectAll}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Select all
                </button>
                {hasFilter && (
                  <button
                    onClick={onClear}
                    className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-muted-foreground">No groups match</p>
              ) : (
                filtered.map((section) => {
                  const color = getSubjectColor(section || course);
                  const checked = !hasFilter || selectedSections.has(section);
                  return (
                    <label
                      key={section}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(section)}
                        className="h-3.5 w-3.5 rounded accent-primary cursor-pointer"
                      />
                      <span className={`h-2 w-2 rounded-full shrink-0 border ${color.border} ${color.bg}`} />
                      <span className="font-mono text-xs text-foreground flex-1">
                        {course} <span className="font-semibold">{section}</span>
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active filter pills */}
      {hasFilter && (
        <div className="flex flex-wrap gap-1.5">
          {[...selectedSections].map((section) => {
            const color = getSubjectColor(section || course);
            return (
              <span
                key={section}
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-xs ${color.bg} ${color.border} ${color.text}`}
              >
                {section}
                <button
                  onClick={() => onToggle(section)}
                  className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
                  aria-label={`Remove ${section}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
