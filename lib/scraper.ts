import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as cheerio from "cheerio";
import type { TimetableEntry, TimetableRequest, TimetableResponse } from "./types";

const BASE_URL =
  "https://simsweb4.uitm.edu.my/estudent/class_timetable/indexIllIl.cfm";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
};

/** Build a session-aware axios instance with a shared cookie jar. */
function createSessionClient() {
  const jar = new CookieJar();
  const client = wrapper(
    axios.create({
      jar,
      withCredentials: true,
      timeout: 30000,
      headers: HEADERS,
    })
  );
  return client;
}

/** Step 1: GET the timetable page and extract all hidden input fields. */
async function getHiddenFields(
  client: ReturnType<typeof createSessionClient>
): Promise<Record<string, string>> {
  const response = await client.get<string>(BASE_URL, {
    responseType: "text",
  });

  const $ = cheerio.load(response.data);
  const hiddenFields: Record<string, string> = {};

  // Dynamically collect every hidden input — never hardcode field names
  $('input[type="hidden"]').each((_, el) => {
    const name = $(el).attr("name");
    const value = $(el).attr("value") ?? "";
    if (name) {
      hiddenFields[name] = value;
    }
  });

  return hiddenFields;
}

/** Step 2–3: POST with hidden fields + search params; parse result for "View" action. */
async function postSearchForm(
  client: ReturnType<typeof createSessionClient>,
  hiddenFields: Record<string, string>,
  req: TimetableRequest
): Promise<{ viewUrl: string | null; viewParams: Record<string, string> | null; html: string }> {
  const formData = new URLSearchParams({
    ...hiddenFields,
    search_campus: req.campus,
    search_faculty: req.faculty,
    search_course: req.course.toUpperCase(),
  });

  const response = await client.post<string>(BASE_URL, formData.toString(), {
    headers: {
      ...HEADERS,
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: BASE_URL,
    },
    responseType: "text",
  });

  const html = response.data as string;
  const $ = cheerio.load(html);

  // Locate the "View" link or button. The site may render it as an <a> or
  // a button that triggers a form/JS call — try several selector strategies.
  let viewUrl: string | null = null;
  let viewParams: Record<string, string> | null = null;

  // Strategy A: plain anchor containing "View" text
  $("a").each((_, el) => {
    const text = $(el).text().trim().toLowerCase();
    const href = $(el).attr("href") ?? "";
    if ((text === "view" || text === "lihat") && href) {
      viewUrl = href.startsWith("http") ? href : resolveUrl(BASE_URL, href);
    }
  });

  // Strategy B: input[type=submit] or button with value "View" inside a form
  if (!viewUrl) {
    $("form").each((_, form) => {
      const hasViewBtn =
        $(form).find('input[value="View"], input[value="Lihat"], button:contains("View")').length > 0;
      if (hasViewBtn) {
        const action = $(form).attr("action") ?? BASE_URL;
        const params: Record<string, string> = {};
        $(form)
          .find("input")
          .each((_, input) => {
            const n = $(input).attr("name");
            const v = $(input).attr("value") ?? "";
            if (n) params[n] = v;
          });
        viewUrl = action.startsWith("http") ? action : resolveUrl(BASE_URL, action);
        viewParams = params;
      }
    });
  }

  // Strategy C: onclick JS with URL fragments e.g. window.location='...' or href='...'
  if (!viewUrl) {
    $("[onclick]").each((_, el) => {
      const onclick = $(el).attr("onclick") ?? "";
      const match = onclick.match(/(?:window\.location\s*=\s*|href\s*=\s*)['"]([^'"]+)['"]/i);
      if (match && match[1]) {
        viewUrl = match[1].startsWith("http") ? match[1] : resolveUrl(BASE_URL, match[1]);
      }
    });
  }

  return { viewUrl, viewParams, html };
}

/** Step 4: Follow the View request using the same session. */
async function fetchTimetablePage(
  client: ReturnType<typeof createSessionClient>,
  viewUrl: string,
  viewParams: Record<string, string> | null
): Promise<string> {
  if (viewParams) {
    // POST to the view URL with form params
    const formData = new URLSearchParams(viewParams);
    const response = await client.post<string>(viewUrl, formData.toString(), {
      headers: {
        ...HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: BASE_URL,
      },
      responseType: "text",
    });
    return response.data as string;
  }

  const response = await client.get<string>(viewUrl, {
    headers: { ...HEADERS, Referer: BASE_URL },
    responseType: "text",
  });
  return response.data as string;
}

/** Step 5: Parse the timetable HTML into normalized TimetableEntry[]. */
function parseTimetableHtml(html: string): { entries: TimetableEntry[]; semester: string } {
  const $ = cheerio.load(html);
  const entries: TimetableEntry[] = [];

  // Extract semester if visible — look for text patterns like "2025/2026-2"
  let semester = "";
  $("*").each((_, el) => {
    const text = $(el).clone().children().remove().end().text().trim();
    if (/\d{4}\/\d{4}-\d/.test(text) && !semester) {
      semester = text.match(/(\d{4}\/\d{4}-\d)/)?.[1] ?? "";
    }
    if (/SEM\s*\d/i.test(text) && !semester) {
      semester = text.match(/(SEM\s*\d[^\s]*)/i)?.[1] ?? "";
    }
  });

  // The timetable is typically an HTML <table>. Each row has columns for
  // Day, Time (start–end), Subject, Section, Venue, Lecturer.
  // Column order can vary — detect by header text.
  $("table").each((_, table) => {
    const rows = $(table).find("tr").toArray();
    if (rows.length < 2) return;

    // Determine column indices from header row
    const headerCells = $(rows[0])
      .find("th, td")
      .toArray()
      .map((el) => $(el).text().trim().toLowerCase());

    const colIndex = {
      day: findColIndex(headerCells, ["day", "hari"]),
      time: findColIndex(headerCells, ["time", "masa", "waktu"]),
      start: findColIndex(headerCells, ["start", "mula"]),
      end: findColIndex(headerCells, ["end", "tamat"]),
      venue: findColIndex(headerCells, ["venue", "tempat", "bilik", "room"]),
      section: findColIndex(headerCells, ["section", "seksyen", "kump", "group"]),
      lecturer: findColIndex(headerCells, ["lecturer", "pensyarah", "instructor", "staff"]),
      course: findColIndex(headerCells, ["course", "subject", "kod", "code"]),
    };

    // Skip tables that don't look like timetable tables
    const hasTimeCols =
      colIndex.time >= 0 || (colIndex.start >= 0 && colIndex.end >= 0);
    if (colIndex.day < 0 && !hasTimeCols) return;

    rows.slice(1).forEach((row) => {
      const cells = $(row)
        .find("td")
        .toArray()
        .map((el) => $(el).text().replace(/\s+/g, " ").trim());

      if (cells.length < 2) return;

      const rawDay = colIndex.day >= 0 ? cells[colIndex.day] : "";
      const normalizedDay = normalizeDay(rawDay);
      if (!normalizedDay) return; // skip non-data rows

      let start = "";
      let end = "";

      if (colIndex.start >= 0 && colIndex.end >= 0) {
        start = normalizeTime(cells[colIndex.start] ?? "");
        end = normalizeTime(cells[colIndex.end] ?? "");
      } else if (colIndex.time >= 0) {
        const timeParts = parseTimeRange(cells[colIndex.time] ?? "");
        start = timeParts.start;
        end = timeParts.end;
      }

      const rawVenue = colIndex.venue >= 0 ? cells[colIndex.venue] : "";
      const venue = rawVenue.trim() || "Online";

      const section = colIndex.section >= 0 ? cells[colIndex.section] : "";
      const lecturer = colIndex.lecturer >= 0 ? cells[colIndex.lecturer] : undefined;

      if (start && end) {
        entries.push({
          day: normalizedDay,
          start,
          end,
          venue,
          section,
          ...(lecturer ? { lecturer } : {}),
        });
      }
    });
  });

  return { entries, semester };
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function resolveUrl(base: string, relative: string): string {
  try {
    return new URL(relative, base).toString();
  } catch {
    return relative;
  }
}

function findColIndex(headers: string[], keywords: string[]): number {
  return headers.findIndex((h) => keywords.some((kw) => h.includes(kw)));
}

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
  friday: "Friday",
  fri: "Friday",
  sabtu: "Saturday",
  saturday: "Saturday",
  sat: "Saturday",
};

function normalizeDay(raw: string): string {
  const key = raw.trim().toLowerCase();
  return DAY_MAP[key] ?? DAY_MAP[key.slice(0, 3)] ?? "";
}

function normalizeTime(raw: string): string {
  // Accept formats: "0800", "08:00", "8:00 AM", "08.00"
  const cleaned = raw.replace(/[.\s]/g, ":");
  const match = cleaned.match(/(\d{1,2}):?(\d{2})/);
  if (!match) return "";
  const h = match[1].padStart(2, "0");
  const m = match[2];
  return `${h}:${m}`;
}

function parseTimeRange(raw: string): { start: string; end: string } {
  // Handles "0800-1000", "08:00 - 10:00", "8.00–10.00"
  const cleaned = raw.replace(/–/g, "-").replace(/\s/g, "");
  const parts = cleaned.split("-");
  if (parts.length >= 2) {
    return {
      start: normalizeTime(parts[0]),
      end: normalizeTime(parts[1]),
    };
  }
  return { start: "", end: "" };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function fetchTimetable(req: TimetableRequest): Promise<TimetableResponse> {
  const client = createSessionClient();

  // Step 1 — GET page, collect cookies + hidden fields
  const hiddenFields = await getHiddenFields(client);

  // Step 2–3 — POST search form
  const { viewUrl, viewParams, html: searchHtml } = await postSearchForm(
    client,
    hiddenFields,
    req
  );

  // Check for "no results" patterns in the search response
  const searchText = searchHtml.toLowerCase();
  if (
    searchText.includes("no record") ||
    searchText.includes("tiada rekod") ||
    searchText.includes("not found") ||
    searchText.includes("0 record")
  ) {
    return { course: req.course.toUpperCase(), semester: "", entries: [] };
  }

  // If no View link found but search result HTML may already contain the timetable,
  // attempt to parse it directly before throwing.
  if (!viewUrl) {
    const { entries, semester } = parseTimetableHtml(searchHtml);
    if (entries.length > 0) {
      return { course: req.course.toUpperCase(), semester, entries };
    }
    throw new Error(
      "NO_RESULTS: Could not find timetable view link in search results. " +
        "The site structure may have changed."
    );
  }

  // Step 4 — Fetch timetable page (same session)
  const timetableHtml = await fetchTimetablePage(client, viewUrl, viewParams);

  // Step 5 — Parse timetable into normalized entries
  const { entries, semester } = parseTimetableHtml(timetableHtml);

  return {
    course: req.course.toUpperCase(),
    semester,
    entries,
  };
}
