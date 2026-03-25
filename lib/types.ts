// ---------- Campus & Faculty ----------

export interface Campus {
  code: string;
  fullname: string;
}

export interface Faculty {
  code: string;
  fullname: string;
}

// ---------- Scraper internals ----------

export interface MainPageInfo {
  hiddenInputs: Record<string, string>;
  submissionPath: string;
  cookieHeader: string;
}

export interface SearchResult {
  subject: string;
  path: string;
}

// ---------- Timetable data ----------

export interface TimetableEntry {
  day: string;
  start: string;
  end: string;
  venue: string;
  section: string;
  lecturer?: string;
}

/** Timetable grouped by group/section name. */
export type GroupedTimetable = Record<string, TimetableEntry[]>;

// ---------- API shapes ----------

export interface SearchRequest {
  campus: string;
  faculty: string;
  course: string;
}

export interface SearchResponse {
  course: string;
  subject: string;
  entries: TimetableEntry[];
}
