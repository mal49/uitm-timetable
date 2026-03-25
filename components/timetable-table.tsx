"use client";

import { AlertTriangle, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSubjectColor, DAYS_OF_WEEK } from "@/lib/constants";
import type { TimetableEntry } from "@/lib/types";

interface TimetableTableProps {
  entries: TimetableEntry[];
  course: string;
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function detectClashes(entries: TimetableEntry[]): Set<TimetableEntry> {
  const clashSet = new Set<TimetableEntry>();
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
        clashSet.add(a);
        clashSet.add(b);
      }
    }
  }
  return clashSet;
}

export function TimetableTable({ entries, course }: TimetableTableProps) {
  const clashSet = detectClashes(entries);

  const sorted = [...entries].sort((a, b) => {
    const dayOrder =
      DAYS_OF_WEEK.indexOf(a.day as (typeof DAYS_OF_WEEK)[number]) -
      DAYS_OF_WEEK.indexOf(b.day as (typeof DAYS_OF_WEEK)[number]);
    if (dayOrder !== 0) return dayOrder;
    return timeToMinutes(a.start) - timeToMinutes(b.start);
  });

  if (sorted.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">No entries to display.</p>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60 border-b border-border">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Day</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Time</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Section</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Venue</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Lecturer</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, idx) => {
              const color = getSubjectColor(entry.section || course);
              const isClash = clashSet.has(entry);
              return (
                <tr
                  key={`${entry.day}-${entry.start}-${entry.section}-${idx}`}
                  className={`border-b border-border last:border-b-0 transition-colors hover:bg-muted/30 ${
                    isClash ? "bg-destructive/5" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                    {entry.day}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-foreground whitespace-nowrap">
                    {entry.start} – {entry.end}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`${color.bg} ${color.border} ${color.text} font-mono text-xs`}
                    >
                      {entry.section || "—"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {entry.venue}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {entry.lecturer ? (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        {entry.lecturer}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isClash ? (
                      <span className="flex items-center gap-1 text-destructive text-xs font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Clash
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {clashSet.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-destructive/10 border-t border-border text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>{clashSet.size} session{clashSet.size !== 1 ? "s" : ""}</strong> have
            time conflicts with another session.
          </span>
        </div>
      )}
    </div>
  );
}
