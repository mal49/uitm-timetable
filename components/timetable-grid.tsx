"use client";

import { useRef, useEffect, useState } from "react";
import { MapPin, User, Clock, ChevronDown, Filter, Search, X } from "lucide-react";
import { getSubjectColor, WEEKDAYS } from "@/lib/constants";
import type { TimetableEntry } from "@/lib/types";

interface TimetableGridProps {
  entries: TimetableEntry[];
  course: string;
}

export function TimetableGrid({ entries, course }: TimetableGridProps) {
  const activeDays = WEEKDAYS.filter((day) => entries.some((e) => e.day === day));
  const sections = [...new Set(entries.map((e) => e.section).filter(Boolean))].sort();

  // cell lookup: "section|day" → entries
  const cellMap = new Map<string, TimetableEntry[]>();
  for (const section of sections) {
    for (const day of activeDays) {
      const key = `${section}|${day}`;
      cellMap.set(
        key,
        entries.filter((e) => e.section === section && e.day === day)
      );
    }
  }

  if (sections.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
        No sessions to display.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="sticky left-0 z-10 bg-muted/40 text-left px-4 py-3 font-semibold text-muted-foreground text-[11px] uppercase tracking-widest w-28 border-r border-border">
                Group
              </th>
              {activeDays.map((day) => (
                <th
                  key={day}
                  className="px-3 py-3 text-center font-semibold text-foreground text-[11px] uppercase tracking-widest border-r border-border last:border-r-0 min-w-[120px]"
                >
                  <span className="sm:hidden">{day.slice(0, 3)}</span>
                  <span className="hidden sm:inline">{day}</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sections.map((section, rowIdx) => {
              const color = getSubjectColor(section || course);
              const isEven = rowIdx % 2 === 0;

              return (
                <tr
                  key={section}
                  className="border-b border-border last:border-b-0 group/row"
                >
                  {/* Section label */}
                  <td
                    className={`sticky left-0 z-10 border-r border-border px-3 py-3 transition-colors ${
                      isEven ? "bg-card group-hover/row:bg-muted/30" : "bg-muted/20 group-hover/row:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full shrink-0 border ${color.bg} ${color.border}`}
                      />
                      <span className={`font-mono font-bold text-xs ${color.text}`}>
                        {section}
                      </span>
                    </div>
                  </td>

                  {/* Day cells */}
                  {activeDays.map((day) => {
                    const key = `${section}|${day}`;
                    const slotEntries = cellMap.get(key) ?? [];

                    return (
                      <td
                        key={day}
                        className={`px-2 py-2 border-r border-border last:border-r-0 align-top transition-colors ${
                          isEven ? "bg-card group-hover/row:bg-muted/30" : "bg-muted/20 group-hover/row:bg-muted/40"
                        }`}
                      >
                        {slotEntries.length === 0 ? (
                          <div className="h-8 flex items-center justify-center">
                            <span className="text-muted-foreground/20 text-base select-none">·</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {slotEntries.map((entry, i) => (
                              <div
                                key={i}
                                className={`rounded-lg border px-2.5 py-2 ${color.bg} ${color.border} ${color.text}`}
                              >
                                <div className="flex items-center gap-1 font-semibold text-[11px] leading-tight">
                                  <Clock className="h-2.5 w-2.5 shrink-0 opacity-60" />
                                  <span>{entry.start}–{entry.end}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] opacity-70 mt-1 truncate">
                                  <MapPin className="h-2.5 w-2.5 shrink-0" />
                                  <span className="truncate">{entry.venue}</span>
                                </div>
                                {entry.lecturer && (
                                  <div className="flex items-center gap-1 text-[10px] opacity-60 mt-0.5 truncate">
                                    <User className="h-2.5 w-2.5 shrink-0" />
                                    <span className="truncate">{entry.lecturer}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TimetableGridSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="border-b border-border bg-muted/40 grid grid-cols-6">
        <div className="h-10 border-r border-border" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 border-r border-border last:border-r-0" />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="grid grid-cols-6 border-b border-border last:border-b-0">
          <div className="h-16 border-r border-border px-3 py-3 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-muted" />
            <div className="h-3 w-14 rounded bg-muted" />
          </div>
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="h-16 border-r border-border last:border-r-0 p-2">
              {(i + j) % 3 !== 0 && (
                <div className="h-full rounded-lg bg-muted/60" />
              )}
            </div>
          ))}
        </div>
      ))}
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
