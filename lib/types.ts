export interface TimetableRequest {
  campus: string;
  faculty: string;
  course: string;
}

export interface TimetableEntry {
  day: string;
  start: string;
  end: string;
  venue: string;
  section: string;
  lecturer?: string;
}

export interface TimetableResponse {
  course: string;
  semester: string;
  entries: TimetableEntry[];
}

export interface ScraperError {
  code: "NO_RESULTS" | "PARSE_ERROR" | "NETWORK_ERROR" | "TIMEOUT" | "UNKNOWN";
  message: string;
}
