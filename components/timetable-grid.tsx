"use client";

import { useRef, useEffect, useState } from "react";
import { MapPin, User, Clock, ChevronDown, Filter, Search, X } from "lucide-react";
import { getSubjectColor, WEEKDAYS } from "@/lib/constants";
import type { TimetableEntry } from "@/lib/types";

interface TimetableGridProps {
  entries: TimetableEntry[];
  course: string;
  /** Five weekday columns regardless of viewport (e.g. mobile JPG export). */
  layoutDesktop?: boolean;
  colorOverrides?: Record<string, string>;
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

export function TimetableGrid({
  entries,
  course,
  layoutDesktop = false,
  colorOverrides,
}: TimetableGridProps) {
  const activeDays = WEEKDAYS.filter((day) => entries.some((e) => e.day === day));
  const days = activeDays.length > 0 ? activeDays : WEEKDAYS;

  const byDay = new Map<(typeof WEEKDAYS)[number], TimetableEntry[]>();
  for (const day of days) byDay.set(day, []);
  for (const e of entries) {
    if (!days.includes(e.day as (typeof WEEKDAYS)[number])) continue;
    byDay.get(e.day as (typeof WEEKDAYS)[number])?.push(e);
  }
  for (const day of days) {
    byDay.set(
      day,
      (byDay.get(day) ?? []).sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
        No sessions to display.
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-border bg-card shadow-sm ${
        layoutDesktop ? "p-4" : "p-3 sm:p-4"
      }`}
    >
      <div
        className={`grid ${
          layoutDesktop ? "gap-4" : "gap-3 sm:gap-4"
        } ${layoutDesktop ? "grid-cols-5" : "md:grid-cols-5"}`}
      >
        {days.map((day) => {
          const dayEntries = byDay.get(day) ?? [];
          return (
            <section
              key={day}
              className={`rounded-2xl border border-border bg-muted/30 ${
                layoutDesktop ? "p-4" : "p-3 sm:p-4"
              }`}
            >
              <header className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  {day}
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  {dayEntries.length}
                </span>
              </header>

              <div className="mt-3 space-y-2">
                {dayEntries.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/70 bg-background/50 px-3 py-4 text-center text-xs text-muted-foreground">
                    No class
                  </div>
                ) : (
                  dayEntries.map((entry, i) => {
                    const colorKey =
                      entry.subjectKey || entry.course || entry.section || course || "SUBJECT";
                    const overrideHex = colorOverrides?.[colorKey];
                    const rgb = overrideHex ? hexToRgb(overrideHex) : null;
                    const color = getSubjectColor(colorKey);
                    const title = (entry.course || entry.subjectKey || course || "SUBJECT").trim();

                    return (
                      <div
                        key={`${day}-${entry.start}-${entry.end}-${entry.section}-${i}`}
                        className={`group relative overflow-hidden rounded-2xl border px-3 py-2.5 shadow-sm transition-transform will-change-transform hover:-translate-y-px ${
                          entry.isClash
                            ? "border-destructive/50 bg-destructive/10 text-destructive"
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
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-extrabold tracking-tight">
                                {title}
                              </span>
                              {entry.section ? (
                                <span className="truncate text-[10px] font-medium opacity-70">
                                  {entry.section.replace(title, "").trim() || entry.section}
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold opacity-90">
                              <Clock className="h-3 w-3 shrink-0 opacity-70" />
                              <span className="tabular-nums">{entry.start}–{entry.end}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] opacity-80">
                          <MapPin className="h-3 w-3 shrink-0 opacity-70" />
                          <span className="truncate">{entry.venue}</span>
                        </div>

                        {entry.lecturer ? (
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] opacity-70">
                            <User className="h-3 w-3 shrink-0 opacity-70" />
                            <span className="truncate">{entry.lecturer}</span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function TimetableGridSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-sm animate-pulse">
      <div className="grid gap-3 sm:gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, col) => (
          <div key={col} className="rounded-2xl border border-border bg-muted/30 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-3 w-6 rounded bg-muted" />
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((__, row) => (
                <div key={row} className="h-20 rounded-2xl bg-muted/70" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legend / filter
// ---------------------------------------------------------------------------

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

            <div className="max-h-60 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-muted-foreground">No groups match</p>
              ) : (
                filtered.map((section) => {
                  const firstInSection = entries.find((e) => e.section === section);
                  const colorKey =
                    firstInSection?.subjectKey || firstInSection?.course || section || course;
                  const color = getSubjectColor(colorKey);
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

      {hasFilter && (
        <div className="flex flex-wrap gap-1.5">
          {[...selectedSections].map((section) => {
            const firstInSection = entries.find((e) => e.section === section);
            const colorKey =
              firstInSection?.subjectKey || firstInSection?.course || section || course;
            const color = getSubjectColor(colorKey);
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
