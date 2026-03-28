import axios from "axios";
import * as cheerio from "cheerio";
import {
  SHAH_ALAM_SPECIAL_CAMPUS_CODES,
  SHAH_ALAM_SPECIAL_COURSE_PREFIXES,
} from "./constants";
import type {
  Campus,
  Faculty,
  MainPageInfo,
  SearchResult,
  TimetableEntry,
  GroupedTimetable,
  SearchRequest,
  SearchResponse,
} from "./types";

const BASE_URL = "https://simsweb4.uitm.edu.my/estudent/class_timetable/";
const REFERER = "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm";

const BASE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: REFERER,
};

const http = axios.create({ timeout: 30000 });

// ---------------------------------------------------------------------------
// Step 1 — Campus list
// ---------------------------------------------------------------------------

export async function fetchCampuses(): Promise<Campus[]> {
  const url =
    `${BASE_URL}cfc/select.cfc?method=CAM_lII1II11I1lIIII11IIl1I111I` +
    `&key=All&page=1&page_limit=100`;

  const res = await http.get<unknown>(url, {
    headers: { ...BASE_HEADERS, Accept: "application/json, text/javascript, */*" },
  });

  const rows = extractRows(res.data);

  return rows
    .filter((row) => row.id !== "X")
    .map((row) => {
      const text = String(row.text ?? row.name ?? "");
      const fullname = text.toUpperCase().includes("SELANGOR")
        ? text.trim()
        : splitAfterFirstDash(text);
      return { code: String(row.id), fullname: fullname.trim() };
    })
    .filter((c) => c.code && c.fullname);
}

// ---------------------------------------------------------------------------
// Step 2 — Faculty list
// ---------------------------------------------------------------------------

export async function fetchFaculties(): Promise<Faculty[]> {
  const url =
    `${BASE_URL}cfc/select.cfc?method=FAC_lII1II11I1lIIII11IIl1I111I` +
    `&key=All&page=1&page_limit=100`;

  const res = await http.get<unknown>(url, {
    headers: { ...BASE_HEADERS, Accept: "application/json, text/javascript, */*" },
  });

  const rows = extractRows(res.data);

  return rows
    .map((row) => {
      const text = String(row.text ?? row.name ?? "");
      const fullname = splitAfterFirstDash(text);
      return { code: String(row.id), fullname: fullname.trim() };
    })
    .filter((f) => f.code && f.fullname);
}

// ---------------------------------------------------------------------------
// Step 3 — Main page: hidden inputs, submission path, cookies
// ---------------------------------------------------------------------------

export async function getMainPageInfo(): Promise<MainPageInfo> {
  const res = await http.get<string>(`${BASE_URL}index.cfm`, {
    headers: BASE_HEADERS,
    responseType: "text",
  });

  // Collect cookies from Set-Cookie headers
  const rawCookies = res.headers["set-cookie"] ?? [];
  const cookieHeader = rawCookies
    .map((c: string) => c.split(";")[0])
    .join("; ");

  const $ = cheerio.load(res.data as string);

  // Collect all hidden inputs
  const hiddenInputs: Record<string, string> = {};
  $('input[type="hidden"]').each((_, el) => {
    const name = $(el).attr("name");
    const value = $(el).attr("value") ?? "";
    if (name) hiddenInputs[name] = value;
  });

  // Parse inline scripts for:
  //   1. document.getElementById('id').value = 'value'
  //   2. url: 'something.cfm...'
  let submissionPath = "";

  $("script").each((_, el) => {
    const src = $(el).html() ?? "";
    if (!src.includes("check_form_before_submit")) return;

    // Extract document.getElementById assignments
    const setValueRe =
      /document\.getElementById\(\s*['"]([^'"]+)['"]\s*\)\.value\s*=\s*['"]([^'"]*)['"]/g;
    let match: RegExpExecArray | null;
    while ((match = setValueRe.exec(src)) !== null) {
      hiddenInputs[match[1]] = match[2];
    }

    // Extract submission URL (url: '...cfm...')
    const urlRe = /url\s*:\s*['"]([^'"]*\.cfm[^'"]*)['"]/i;
    const urlMatch = src.match(urlRe);
    if (urlMatch?.[1]) {
      submissionPath = urlMatch[1].replace(/^\//, "");
    }
  });

  // Fallback: try any <form> action
  if (!submissionPath) {
    const formAction = $("form").first().attr("action") ?? "";
    if (formAction) {
      submissionPath = formAction.replace(/^\//, "").replace(/^.*class_timetable\//, "");
    }
  }

  console.log("[scraper] submissionPath:", submissionPath || "(fallback index.cfm)");

  return { hiddenInputs, submissionPath, cookieHeader };
}

// ---------------------------------------------------------------------------
// Step 4 — Search subjects (POST), returns [{subject, path}]
// ---------------------------------------------------------------------------

export async function searchSubjects(
  info: MainPageInfo,
  req: SearchRequest
): Promise<SearchResult[]> {
  const targetUrl = info.submissionPath
    ? `${BASE_URL}${info.submissionPath}`
    : `${BASE_URL}index.cfm`;

  const formData = new URLSearchParams({
    ...info.hiddenInputs,
    search_campus: req.campus,
    search_faculty: req.faculty ?? "",
    search_course: req.course.toUpperCase(),
  });

  console.log("[scraper] POST", targetUrl, "campus:", req.campus, "course:", req.course);

  const res = await http.post<string>(targetUrl, formData.toString(), {
    headers: {
      ...BASE_HEADERS,
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: info.cookieHeader,
    },
    responseType: "text",
  });

  const html = res.data as string;
  console.log("[scraper] search response length:", html.length);
  if (html.length < 2000) {
    const msg = html.replace(/\s+/g, " ").trim().slice(0, 300);
    console.log("[scraper] short response (no results):", msg);
  }

  // Remove script tags to make HTML parsing cleaner
  const $ = cheerio.load(html);
  $("script").remove();

  const results: SearchResult[] = [];

  // Find the results table — look for rows containing anchor links to timetable pages.
  // Match anchors by text ("view", "lihat") OR by href containing ".cfm".
  $("table tr").each((_, row) => {
    const $row = $(row);

    const viewAnchor = $row.find('a[href]').filter((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      const href = $(el).attr("href") ?? "";
      return (
        text === "view" ||
        text === "lihat" ||
        text.includes("view") ||
        href.includes(".cfm")
      );
    }).first();

    if (!viewAnchor.length) return;

    const href = viewAnchor.attr("href") ?? "";
    if (!href) return;

    // Collect all cell texts from this row, excluding the anchor cell itself
    const cells = $row.find("td");
    let subjectText = "";
    cells.each((_, td) => {
      const text = $(td).text().replace(/\s+/g, " ").trim();
      const lower = text.toLowerCase();
      // Skip empty, pure-numeric (row numbers), link-text, or short cells
      if (
        !text ||
        text.length <= 1 ||
        /^\d+$/.test(text) ||
        lower === "view" ||
        lower === "lihat" ||
        lower.includes("view timetable")
      ) {
        return;
      }
      subjectText = text;
      return false; // take the first meaningful cell
    });

    const subject = subjectText.replace(/\./g, "").trim();
    const path = href
      .replace(/^https?:\/\/simsweb4\.uitm\.edu\.my\/estudent\/class_timetable\//, "")
      .replace(/^\/estudent\/class_timetable\//, "")
      .replace(/^\//, "");

    if (path) {
      console.log("[scraper] subject:", subject || "(unknown)", "path:", path);
      results.push({ subject, path });
    }
  });

  console.log("[scraper] results found:", results.length);

  return results;
}

// ---------------------------------------------------------------------------
// Step 5 — Fetch and parse timetable for a given path
// ---------------------------------------------------------------------------

export async function fetchSubjectTimetable(
  path: string,
  cookieHeader: string
): Promise<GroupedTimetable> {
  const url = `${BASE_URL}${path}`;

  const res = await http.get<string>(url, {
    headers: { ...BASE_HEADERS, Cookie: cookieHeader },
    responseType: "text",
  });

  const rawHtml = res.data as string;
  console.log("[scraper] timetable response length:", rawHtml.length);

  const $ = cheerio.load(rawHtml);
  $("script").remove();

  const grouped: GroupedTimetable = {};

  $("table").each((_, table) => {
    const rows = $(table).find("tr").toArray();
    if (rows.length < 2) return;

    // Detect columns from header row
    const headerCells = $(rows[0])
      .find("th, td")
      .toArray()
      .map((el) => $(el).text().trim().toLowerCase());

    const colIdx = {
      group: findColIndex(headerCells, ["group", "kump", "section", "seksyen", "kumpulan"]),
      day: findColIndex(headerCells, ["day", "hari"]),
      time: findColIndex(headerCells, ["time", "masa", "waktu"]),
      start: findColIndex(headerCells, ["start", "mula"]),
      end: findColIndex(headerCells, ["end", "tamat"]),
      venue: findColIndex(headerCells, ["venue", "tempat", "bilik", "room"]),
      lecturer: findColIndex(headerCells, ["lecturer", "pensyarah", "instructor", "staff"]),
    };

    // "day time" combined column: a single column matched by both "day" and "time" keywords
    const isDayTimeCombined = colIdx.day >= 0 && colIdx.day === colIdx.time;

    const hasRequiredCols =
      colIdx.day >= 0 &&
      (colIdx.time >= 0 || (colIdx.start >= 0 && colIdx.end >= 0));

    console.log("[scraper] headers:", headerCells, "| colIdx:", colIdx);

    if (!hasRequiredCols) return;

    rows.slice(1).forEach((row) => {
      const cells = $(row)
        .find("td")
        .toArray()
        .map((el) => $(el).text().replace(/\s+/g, " ").trim());

      if (cells.length < 2) return;

      const rawDayTime = cells[colIdx.day] ?? "";

      // When the column is combined ("day time"), the cell holds e.g. "MONDAY 08:00 - 10:00"
      // or "ISNIN 08:00 - 10:00". We split on the first space after the day token.
      let rawDayOnly = rawDayTime;
      let rawTimeOnly = rawDayTime;
      if (isDayTimeCombined) {
        const spaceIdx = rawDayTime.search(/\s+\d/);
        if (spaceIdx > 0) {
          rawDayOnly = rawDayTime.slice(0, spaceIdx).trim();
          rawTimeOnly = rawDayTime.slice(spaceIdx).trim();
        }
      }

      const day = normalizeDay(rawDayOnly);
      if (!day) return;

      let start = "";
      let end = "";
      if (colIdx.start >= 0 && colIdx.end >= 0) {
        start = normalizeTime(cells[colIdx.start] ?? "");
        end = normalizeTime(cells[colIdx.end] ?? "");
      } else if (colIdx.time >= 0) {
        const timeSource = isDayTimeCombined ? rawTimeOnly : (cells[colIdx.time] ?? "");
        const parsed = parseTimeRange(timeSource);
        start = parsed.start;
        end = parsed.end;
      }
      if (!start || !end) return;

      const rawVenue = colIdx.venue >= 0 ? (cells[colIdx.venue] ?? "") : "";
      const venue = rawVenue.trim() || "Online";
      const lecturer =
        colIdx.lecturer >= 0 && cells[colIdx.lecturer]
          ? cells[colIdx.lecturer]
          : undefined;

      // Group name
      const groupName =
        colIdx.group >= 0 && cells[colIdx.group]
          ? cells[colIdx.group].trim()
          : "DEFAULT";

      const entry: TimetableEntry = {
        day,
        start,
        end,
        venue,
        section: groupName,
        ...(lecturer ? { lecturer } : {}),
      };

      if (!grouped[groupName]) grouped[groupName] = [];
      grouped[groupName].push(entry);
    });
  });

  return grouped;
}

// ---------------------------------------------------------------------------
// Public entry point — full search flow
// ---------------------------------------------------------------------------

// All three are administratively the same Shah Alam campus but categorised
// differently in the UiTM portal. Students often don't know which bucket
// their course falls under, so we try all three before giving up.
const SHAH_ALAM_COURSE_TYPES = ["HEP", "APB", "CITU"] as const;

export async function searchSubjectsWithFallback(
  info: MainPageInfo,
  req: SearchRequest
): Promise<{ results: SearchResult[]; effectiveCampus: string }> {
  const searchOrder = getShahAlamSearchOrder(req.campus, req.course);
  let results: SearchResult[] = [];
  let effectiveCampus = searchOrder[0] ?? req.campus;

  for (const campus of searchOrder) {
    if (campus !== req.campus) {
      console.log("[scraper] retrying with campus:", campus);
    }

    results = await searchSubjects(info, { ...req, campus });
    effectiveCampus = campus;

    if (results.length > 0) {
      break;
    }
  }

  return { results, effectiveCampus };
}

export async function searchTimetable(req: SearchRequest): Promise<SearchResponse> {
  // Step 3: get session info (single session reused across retries)
  const info = await getMainPageInfo();

  // Step 4: search subjects — with automatic fallback across Shah Alam types
  const { results, effectiveCampus } = await searchSubjectsWithFallback(info, req);

  if (results.length === 0) {
    return {
      course: req.course.toUpperCase(),
      subject: req.course.toUpperCase(),
      entries: [],
    };
  }

  console.log("[scraper] found under campus:", effectiveCampus);

  // Step 5: fetch timetable for the first matching result
  const first = results[0]!;
  const grouped = await fetchSubjectTimetable(first.path, info.cookieHeader);

  // Flatten grouped data into entries (section = group name)
  const entries: TimetableEntry[] = Object.values(grouped).flat();

  // Use the parsed subject name; fall back to the course code if it's empty or
  // ended up as a bare number (e.g. a row-number cell was picked up instead).
  const subjectName =
    first.subject && !/^\d+$/.test(first.subject)
      ? first.subject
      : req.course.toUpperCase();

  return {
    course: req.course.toUpperCase(),
    subject: subjectName,
    entries,
  };
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Extract rows from various ColdFusion CFC JSON response shapes. */
function extractRows(data: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(data)) return data as Array<Record<string, unknown>>;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["rows", "data", "result", "items", "list"]) {
      if (Array.isArray(obj[key])) return obj[key] as Array<Record<string, unknown>>;
    }
    // ColdFusion sometimes wraps: { "DATA": [...], "COLUMNS": [...] }
    if (Array.isArray(obj["DATA"]) && Array.isArray(obj["COLUMNS"])) {
      const cols = obj["COLUMNS"] as string[];
      return (obj["DATA"] as unknown[][]).map((row) => {
        const record: Record<string, unknown> = {};
        cols.forEach((col, i) => { record[col.toLowerCase()] = row[i]; });
        return record;
      });
    }
  }
  return [];
}

function splitAfterFirstDash(text: string): string {
  const idx = text.indexOf("-");
  if (idx === -1) return text;
  return text.slice(idx + 1).trim();
}

function getShahAlamSearchOrder(campus: string, course: string): string[] {
  if (!SHAH_ALAM_SPECIAL_CAMPUS_CODES.has(campus)) {
    return [campus];
  }

  const normalizedCourse = course.trim().toUpperCase();
  const inferredCampus = inferShahAlamCampusFromCourse(normalizedCourse);
  const order = [
    inferredCampus,
    campus,
    ...SHAH_ALAM_COURSE_TYPES,
  ].filter((value): value is string => Boolean(value));

  return [...new Set(order)];
}

function inferShahAlamCampusFromCourse(course: string): string | null {
  for (const [campus, prefixes] of Object.entries(SHAH_ALAM_SPECIAL_COURSE_PREFIXES)) {
    if (prefixes.some((prefix) => course.startsWith(prefix))) {
      return campus;
    }
  }

  return null;
}

function findColIndex(headers: string[], keywords: string[]): number {
  return headers.findIndex((h) => keywords.some((kw) => h.includes(kw)));
}

const DAY_MAP: Record<string, string> = {
  ahad: "Sunday", sunday: "Sunday", sun: "Sunday",
  isnin: "Monday", monday: "Monday", mon: "Monday",
  selasa: "Tuesday", tuesday: "Tuesday", tue: "Tuesday",
  rabu: "Wednesday", wednesday: "Wednesday", wed: "Wednesday",
  khamis: "Thursday", thursday: "Thursday", thu: "Thursday",
  jumaat: "Friday", friday: "Friday", fri: "Friday",
  sabtu: "Saturday", saturday: "Saturday", sat: "Saturday",
};

function normalizeDay(raw: string): string {
  const key = raw.trim().toLowerCase();
  if (DAY_MAP[key]) return DAY_MAP[key]!;
  // Check if any known day token is a prefix of (or equals) the first word
  // Handles "MONDAY 08:00-10:00" → firstWord = "monday"
  // and Malay "ISNIN 08:00-10:00" → firstWord = "isnin"
  const firstWord = key.split(/[\s,./\n]/)[0] ?? "";
  if (DAY_MAP[firstWord]) return DAY_MAP[firstWord]!;
  // English 3-char abbreviations: "mon", "tue", "wed", "thu", "fri", "sat", "sun"
  if (DAY_MAP[firstWord.slice(0, 3)]) return DAY_MAP[firstWord.slice(0, 3)]!;
  if (DAY_MAP[key.slice(0, 3)]) return DAY_MAP[key.slice(0, 3)]!;
  return "";
}

function normalizeTime(raw: string): string {
  const cleaned = raw.replace(/[.\s]/g, ":").replace(/:+/g, ":");
  const match = cleaned.match(/(\d{1,2}):?(\d{2})/);
  if (!match) return "";
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function parseTimeRange(raw: string): { start: string; end: string } {
  const cleaned = raw.replace(/–/g, "-").replace(/\s/g, "");
  const parts = cleaned.split("-");
  if (parts.length >= 2) {
    return { start: normalizeTime(parts[0] ?? ""), end: normalizeTime(parts[1] ?? "") };
  }
  return { start: "", end: "" };
}
