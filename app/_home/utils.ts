import type { MyStudentImportResult } from "@/lib/importers/mystudent";
import type { GroupedTimetable, TimetableEntry } from "@/lib/types";
import type { SubjectItem } from "@/app/_home/types";

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function entryKey(entry: TimetableEntry) {
  return [
    entry.subjectKey ?? "",
    entry.course ?? "",
    entry.section ?? "",
    entry.day,
    entry.start,
    entry.end,
    entry.venue,
    entry.lecturer ?? "",
  ].join("|");
}

export function makeId() {
  return Math.random().toString(16).slice(2);
}

export function groupKeys(grouped?: GroupedTimetable) {
  return Object.keys(grouped ?? {}).sort();
}

export function normalizeHexColor(value: string) {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return /^#[0-9a-fA-F]{6}$/.test(withHash) ? withHash.toLowerCase() : null;
}

export function buildSubjectItemsFromImport(
  result: MyStudentImportResult,
): SubjectItem[] {
  return result.subjects.map((subject) => ({
    id: `mystudent-${subject.course}-${makeId()}`,
    source: "mystudent",
    course: subject.course,
    status: "ready",
    matches: [],
    subjectName: subject.subjectName,
    grouped: subject.grouped,
    selectedGroup: subject.defaultGroup,
    groupFilter: "",
    showSelectedOnly: false,
    importedAt: result.importedAt,
    exportedAt: result.exportedAt,
  }));
}

export function formatImportTimestampLabel(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function findClashingEntryKeys(entries: TimetableEntry[]) {
  const byDay = new Map<string, TimetableEntry[]>();
  for (const entry of entries) {
    const day = entry.day ?? "";
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(entry);
  }

  const clashes = new Set<string>();

  for (const dayEntries of byDay.values()) {
    const sorted = [...dayEntries].sort(
      (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
    );

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i]!;
      const currentStart = timeToMinutes(current.start);
      let currentEnd = timeToMinutes(current.end);

      for (let j = i + 1; j < sorted.length; j++) {
        const next = sorted[j]!;
        const nextStart = timeToMinutes(next.start);
        const nextEnd = timeToMinutes(next.end);

        if (nextStart >= currentEnd) break;

        if (currentStart < nextEnd && nextStart < currentEnd) {
          clashes.add(entryKey(current));
          clashes.add(entryKey(next));
        }

        if (nextEnd > currentEnd) {
          currentEnd = nextEnd;
        }
      }
    }
  }

  return clashes;
}

export function buildCombinedEntries(items: SubjectItem[]) {
  return items.flatMap((item) => {
    if (!item.grouped || !item.selectedGroup) return [];

    const course = item.course;
    const subjectName = item.subjectName || course;
    const entries = item.grouped[item.selectedGroup] ?? [];

    return entries.map((entry) => ({
      ...entry,
      course,
      subjectName,
      subjectKey: course,
      section: `${course} ${item.selectedGroup}`.trim(),
    }));
  });
}

export function markClashes(entries: TimetableEntry[]) {
  const clashKeys = findClashingEntryKeys(entries);
  return entries.map((entry) => ({
    ...entry,
    isClash: clashKeys.has(entryKey(entry)),
  }));
}

export function overlaps(a: TimetableEntry, b: TimetableEntry) {
  return (
    a.day === b.day &&
    timeToMinutes(a.start) < timeToMinutes(b.end) &&
    timeToMinutes(b.start) < timeToMinutes(a.end)
  );
}

export type ClashPair = { a: TimetableEntry; b: TimetableEntry };

/** Overlapping pairs between different subjects, in input order. */
export function findClashPairs(entries: TimetableEntry[]): ClashPair[] {
  const pairs: ClashPair[] = [];
  entries.forEach((a, i) => {
    for (const b of entries.slice(i + 1)) {
      if (a.course !== b.course && overlaps(a, b)) pairs.push({ a, b });
    }
  });
  return pairs;
}

/** Course code of the first entry in `others` that `candidate` would overlap. */
export function clashingCourse(candidate: TimetableEntry[], others: TimetableEntry[]) {
  return others.find((other) => candidate.some((entry) => overlaps(entry, other)))?.course ?? null;
}

/** "CSC584 - ENTERPRISE PROGRAMMING" -> { code, name } */
export function splitSubjectLabel(label: string, fallbackCode: string) {
  const match = label.match(/^([A-Z]{2,4}\d{3}[A-Z]?)\s*[-:–]?\s*(.*)$/i);
  return {
    code: (match?.[1] ?? fallbackCode).toUpperCase(),
    name: (match?.[2] || label).trim(),
  };
}

export function minutesToLabel(minutes: number) {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

export { timeToMinutes };

/** "Mon 8:00 · Wed 10:00" style summary of a group's sessions. */
export function summarizeSessions(entries: TimetableEntry[]) {
  return entries
    .map((entry) => `${entry.day.slice(0, 3)} ${minutesToLabel(timeToMinutes(entry.start))}`)
    .join(" · ");
}

/** Portal names arrive in ALL CAPS; show them in title case. */
export function displayName(name: string) {
  if (name !== name.toUpperCase()) return name;
  return name.toLowerCase().replace(/\b[a-z]/g, (char) => char.toUpperCase());
}
