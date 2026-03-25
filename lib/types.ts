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
  /**
   * Optional key for coloring/labeling when combining multiple subjects.
   * When absent, consumers can fall back to `section` or the parent course code.
   */
  subjectKey?: string;
  /** Optional display name for the subject (combined mode). */
  subjectName?: string;
  /** Optional course code (combined mode). */
  course?: string;
  /** True when this entry overlaps with another selected entry. */
  isClash?: boolean;
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

// ---------- Custom timetable builder API shapes ----------

export type SubjectsRequest = SearchRequest;

export interface SubjectsResponse {
  course: string;
  results: SearchResult[];
}

export interface TimetableByPathRequest {
  path: string;
  course?: string;
  subject?: string;
}

export interface TimetableByPathResponse {
  course: string;
  subject: string;
  path: string;
  grouped: GroupedTimetable;
}
