import type { GroupedTimetable, TimetableEntry } from "@/lib/types";

export const MYSTUDENT_IMPORT_SOURCE = "mystudent";
export const MYSTUDENT_IMPORT_VERSION = 1;

export type MyStudentImportSession = {
  subjectCode?: unknown;
  subjectName?: unknown;
  group?: unknown;
  section?: unknown;
  date?: unknown;
  day?: unknown;
  start?: unknown;
  end?: unknown;
  time?: unknown;
  venue?: unknown;
  lecturer?: unknown;
  source?: unknown;
};

export type MyStudentImportPayload = {
  source?: unknown;
  version?: unknown;
  exportedAt?: unknown;
  sessions?: unknown;
};

type MyStudentCdnSession = {
  courseid?: unknown;
  course_desc?: unknown;
  groups?: unknown;
  masa?: unknown;
  bilik?: unknown;
  lecturer?: unknown;
};

type MyStudentCdnDay = {
  hari?: unknown;
  jadual?: unknown;
};

type MyStudentNormalizedPayload = {
  version: number;
  exportedAt?: string;
  sessions: MyStudentImportSession[];
};

export type MyStudentImportWarning = {
  row?: number;
  message: string;
};

export type MyStudentImportedSubject = {
  course: string;
  subjectName: string;
  defaultGroup: string;
  grouped: GroupedTimetable;
  sessionCount: number;
};

export type MyStudentImportResult = {
  source: typeof MYSTUDENT_IMPORT_SOURCE;
  version: number;
  importedAt: string;
  exportedAt?: string;
  subjects: MyStudentImportedSubject[];
  warnings: MyStudentImportWarning[];
  summary: {
    subjectCount: number;
    sessionCount: number;
    invalidRows: number;
    duplicateRows: number;
  };
};

type SubjectAccumulator = {
  course: string;
  subjectName: string;
  grouped: GroupedTimetable;
  groupOrder: string[];
  sessionCount: number;
};

const DAY_MAP: Record<string, string> = {
  ahad: "Sunday",
  sunday: "Sunday",
  sun: "Sunday",
  isnin: "Monday",
  monday: "Monday",
  mon: "Monday",
  selasa: "Tuesday",
  tuesday: "Tuesday",
  tue: "Tuesday",
  rabu: "Wednesday",
  wednesday: "Wednesday",
  wed: "Wednesday",
  khamis: "Thursday",
  thursday: "Thursday",
  thu: "Thursday",
  jumaat: "Friday",
  jumat: "Friday",
  friday: "Friday",
  fri: "Friday",
  sabtu: "Saturday",
  saturday: "Saturday",
  sat: "Saturday",
};

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export function parseMyStudentImportText(input: string): MyStudentImportResult {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Add a MyStudent JSON export before previewing the import.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error("Invalid JSON. Check the file or pasted content and try again.");
  }

  return parseMyStudentImportData(parsed);
}

export function parseMyStudentImportData(parsed: unknown): MyStudentImportResult {
  const payload = normalizePayload(parsed);
  const warnings: MyStudentImportWarning[] = [];
  const subjectMap = new Map<string, SubjectAccumulator>();
  const seenEntries = new Set<string>();
  let invalidRows = 0;
  let duplicateRows = 0;

  payload.sessions.forEach((session, index) => {
    const normalized = normalizeSession(session, index + 1, warnings);
    if (!normalized) {
      invalidRows += 1;
      return;
    }

    const dedupeKey = [
      normalized.course,
      normalized.group,
      normalized.entry.day,
      normalized.entry.start,
      normalized.entry.end,
      normalized.entry.venue,
      normalized.entry.lecturer ?? "",
    ].join("|");

    if (seenEntries.has(dedupeKey)) {
      duplicateRows += 1;
      warnings.push({
        row: index + 1,
        message: `Dropped duplicate session for ${normalized.course} ${normalized.group}.`,
      });
      return;
    }
    seenEntries.add(dedupeKey);

    const subjectKey = `${normalized.course}|||${normalized.subjectName}`;
    let subject = subjectMap.get(subjectKey);
    if (!subject) {
      subject = {
        course: normalized.course,
        subjectName: normalized.subjectName,
        grouped: {},
        groupOrder: [],
        sessionCount: 0,
      };
      subjectMap.set(subjectKey, subject);
    }

    if (!subject.grouped[normalized.group]) {
      subject.grouped[normalized.group] = [];
      subject.groupOrder.push(normalized.group);
    }

    subject.grouped[normalized.group]!.push(normalized.entry);
    subject.sessionCount += 1;
  });

  const subjects = [...subjectMap.values()]
    .sort((a, b) => a.course.localeCompare(b.course) || a.subjectName.localeCompare(b.subjectName))
    .map((subject) => {
      Object.values(subject.grouped).forEach((entries) => {
        entries.sort(compareEntries);
      });

      return {
        course: subject.course,
        subjectName: subject.subjectName,
        defaultGroup: subject.groupOrder[0] ?? "Imported",
        grouped: subject.grouped,
        sessionCount: subject.sessionCount,
      };
    });

  const sessionCount = subjects.reduce((total, subject) => total + subject.sessionCount, 0);

  if (sessionCount === 0) {
    throw new Error("The JSON was valid, but no timetable sessions could be imported.");
  }

  return {
    source: MYSTUDENT_IMPORT_SOURCE,
    version: payload.version,
    importedAt: new Date().toISOString(),
    exportedAt: payload.exportedAt,
    subjects,
    warnings,
    summary: {
      subjectCount: subjects.length,
      sessionCount,
      invalidRows,
      duplicateRows,
    },
  };
}

function normalizePayload(parsed: unknown): {
  version: number;
  exportedAt?: string;
  sessions: MyStudentImportSession[];
} {
  if (Array.isArray(parsed)) {
    return {
      version: MYSTUDENT_IMPORT_VERSION,
      sessions: parsed as MyStudentImportSession[],
    };
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Expected a JSON object or array for the MyStudent import.");
  }

  const payload = parsed as MyStudentImportPayload;
  if (Array.isArray(payload.sessions)) {
    const version =
      typeof payload.version === "number" && Number.isFinite(payload.version)
        ? payload.version
        : MYSTUDENT_IMPORT_VERSION;

    return {
      version,
      exportedAt:
        typeof payload.exportedAt === "string" && payload.exportedAt.trim()
          ? payload.exportedAt.trim()
          : undefined,
      sessions: payload.sessions as MyStudentImportSession[],
    };
  }

  const cdnPayload = normalizeCdnPayload(parsed);
  if (cdnPayload) return cdnPayload;

  throw new Error(
    "Expected either a `sessions` array export or the raw MyStudent CDN timetable JSON.",
  );
}

function normalizeCdnPayload(parsed: unknown): MyStudentNormalizedPayload | null {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  const payloadEntries = Object.entries(parsed as Record<string, MyStudentCdnDay>);
  if (payloadEntries.length === 0) return null;

  const sessions: MyStudentImportSession[] = [];
  const seenEntries = new Set<string>();
  let matchedDayCount = 0;

  payloadEntries
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([date, dayData]) => {
      if (!dayData || typeof dayData !== "object" || !Array.isArray(dayData.jadual)) {
        return;
      }

      matchedDayCount += 1;

      dayData.jadual.forEach((session) => {
        const normalized = normalizeCdnSession(
          date,
          dayData.hari,
          session as MyStudentCdnSession,
        );

        if (!normalized) return;

        const dedupeKey = [
          normalized.subjectCode,
          normalized.group,
          normalized.day,
          normalized.start,
          normalized.end,
          normalized.venue,
          normalized.lecturer ?? "",
        ].join("|");

        if (seenEntries.has(dedupeKey)) return;
        seenEntries.add(dedupeKey);
        sessions.push(normalized);
      });
    });

  if (matchedDayCount === 0) return null;

  return {
    version: MYSTUDENT_IMPORT_VERSION,
    sessions,
  };
}

function normalizeCdnSession(
  date: string,
  dayLabel: unknown,
  session: MyStudentCdnSession,
): MyStudentImportSession | null {
  if (!session || typeof session !== "object") return null;

  const subjectCode = normalizeCourseCode(session.courseid);
  const subjectName = stringOrUndefined(session.course_desc);
  const group = stringOrUndefined(session.groups);
  const day = normalizeDay(stringOrUndefined(dayLabel) ?? "");
  const { start, end } = parseTimeRange(stringOrUndefined(session.masa) ?? "");

  if (!subjectCode || !subjectName || !group || !day || !start || !end) {
    return null;
  }

  return {
    subjectCode,
    subjectName,
    group,
    day,
    start,
    end,
    venue: stringOrUndefined(session.bilik) || "Online",
    lecturer: stringOrUndefined(session.lecturer) || "",
    source: MYSTUDENT_IMPORT_SOURCE,
    ...(date ? { date } : {}),
  };
}

function normalizeSession(
  value: MyStudentImportSession,
  rowNumber: number,
  warnings: MyStudentImportWarning[],
): { course: string; subjectName: string; group: string; entry: TimetableEntry } | null {
  if (!value || typeof value !== "object") {
    warnings.push({ row: rowNumber, message: "Skipped row because it is not an object." });
    return null;
  }

  const course = normalizeCourseCode(value.subjectCode);
  if (!course) {
    warnings.push({ row: rowNumber, message: "Skipped row because `subjectCode` is missing." });
    return null;
  }

  const subjectName =
    stringOrUndefined(value.subjectName) ||
    stringOrUndefined((value as { subject?: unknown }).subject) ||
    course;

  const group =
    stringOrUndefined(value.group) ||
    stringOrUndefined(value.section) ||
    "Imported";

  const day = normalizeDay(stringOrUndefined(value.day) ?? "");
  if (!day) {
    warnings.push({
      row: rowNumber,
      message: `Skipped ${course} because the day value could not be parsed.`,
    });
    return null;
  }

  let start = normalizeTime(stringOrUndefined(value.start) ?? "");
  let end = normalizeTime(stringOrUndefined(value.end) ?? "");

  if ((!start || !end) && stringOrUndefined(value.time)) {
    const parsedRange = parseTimeRange(stringOrUndefined(value.time) ?? "");
    start ||= parsedRange.start;
    end ||= parsedRange.end;
  }

  if (!start || !end) {
    warnings.push({
      row: rowNumber,
      message: `Skipped ${course} because the time range is incomplete.`,
    });
    return null;
  }

  if (toMinutes(start) >= toMinutes(end)) {
    warnings.push({
      row: rowNumber,
      message: `Skipped ${course} because the start time is not before the end time.`,
    });
    return null;
  }

  const venue = stringOrUndefined(value.venue) || "Online";
  const lecturer = stringOrUndefined(value.lecturer);
  const source = stringOrUndefined(value.source);

  if (source && source !== MYSTUDENT_IMPORT_SOURCE) {
    warnings.push({
      row: rowNumber,
      message: `Row source "${source}" was accepted, but expected "${MYSTUDENT_IMPORT_SOURCE}".`,
    });
  }

  return {
    course,
    subjectName,
    group,
    entry: {
      day,
      start,
      end,
      venue,
      section: group,
      ...(lecturer ? { lecturer } : {}),
    },
  };
}

function normalizeCourseCode(value: unknown) {
  const raw = stringOrUndefined(value);
  if (!raw) return "";
  return raw.replace(/\s+/g, "").toUpperCase();
}

function stringOrUndefined(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeDay(raw: string) {
  const key = raw.trim().toLowerCase();
  if (!key) return "";
  if (DAY_MAP[key]) return DAY_MAP[key]!;

  const firstWord = key.split(/[\s,./-]/)[0] ?? "";
  if (DAY_MAP[firstWord]) return DAY_MAP[firstWord]!;
  if (DAY_MAP[firstWord.slice(0, 3)]) return DAY_MAP[firstWord.slice(0, 3)]!;

  return "";
}

function normalizeTime(raw: string) {
  const cleaned = raw
    .trim()
    .replace(/[.]/g, ":")
    .replace(/\s+/g, " ")
    .toUpperCase();
  if (!cleaned) return "";

  const directToken = extractFirstTimeToken(cleaned);
  const candidate = directToken || cleaned;

  const ampmMatch = candidate.match(/^(\d{1,2})(?::?(\d{2}))?\s*(AM|PM)$/);
  if (ampmMatch) {
    let hour = Number(ampmMatch[1] ?? "0");
    const minute = Number(ampmMatch[2] ?? "0");
    const meridiem = ampmMatch[3];
    if (hour > 23 || minute > 59) return "";

    // UiTM sometimes emits 24-hour values with an AM/PM suffix, for example "16:00 PM".
    // Treat those as already-24-hour rather than rejecting or double-applying the meridiem.
    if (hour <= 12) {
      if (hour === 12) hour = 0;
      if (meridiem === "PM") hour += 12;
    }

    if (hour > 23) return "";
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  const numeric = candidate.replace(/\s/g, "");
  const compact = numeric.match(/^(\d{1,2})(\d{2})$/);
  if (compact) {
    const hour = Number(compact[1] ?? "0");
    const minute = Number(compact[2] ?? "0");
    if (hour <= 23 && minute <= 59) {
      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
  }

  const colon = candidate.match(/(\d{1,2})(?::(\d{2}))?/);
  if (!colon) return "";
  const hour = Number(colon[1] ?? "0");
  const minute = Number(colon[2] ?? "0");
  if (hour > 23 || minute > 59) return "";
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function parseTimeRange(raw: string) {
  const normalized = raw.replace(/[–—]/g, "-");
  const segmented = normalized
    .split("-")
    .map((part) => normalizeTime(part ?? ""))
    .filter(Boolean);

  if (segmented.length >= 2) {
    return { start: segmented[0] ?? "", end: segmented[1] ?? "" };
  }

  const extracted = extractTimeTokens(normalized);
  if (extracted.length >= 2) {
    return {
      start: normalizeTime(extracted[0] ?? ""),
      end: normalizeTime(extracted[1] ?? ""),
    };
  }

  return { start: "", end: "" };
}

function extractFirstTimeToken(value: string) {
  return extractTimeTokens(value)[0] ?? "";
}

function extractTimeTokens(value: string) {
  const matches = value.match(
    /\b\d{1,2}(?::\d{2})?\s*(?:AM|PM)\b|\b\d{3,4}\b|\b\d{1,2}:\d{2}\b/gi,
  );

  if (!matches) return [];

  return matches
    .map((match) => match.trim().replace(/\s+/g, " ").toUpperCase())
    .filter(Boolean);
}

function toMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return (hour ?? 0) * 60 + (minute ?? 0);
}

function compareEntries(a: TimetableEntry, b: TimetableEntry) {
  const dayDiff = DAY_ORDER.indexOf(a.day as (typeof DAY_ORDER)[number]) - DAY_ORDER.indexOf(b.day as (typeof DAY_ORDER)[number]);
  if (dayDiff !== 0) return dayDiff;
  return toMinutes(a.start) - toMinutes(b.start);
}
