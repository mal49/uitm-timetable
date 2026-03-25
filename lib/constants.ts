import type { Campus, Faculty } from "./types";

// ---------------------------------------------------------------------------
// Fallback lists — used when the /api/campuses or /api/faculties calls fail.
// These are the most common UiTM campuses and faculties.
// ---------------------------------------------------------------------------

export const FALLBACK_CAMPUSES: Campus[] = [
  // Selangor (Shah Alam) — regular + special course-type entries
  { code: "B",    fullname: "Shah Alam" },
  { code: "HEP",  fullname: "Shah Alam – Language Courses" },
  { code: "APB",  fullname: "Shah Alam – CITU Courses" },
  { code: "CITU", fullname: "Shah Alam – Co-Curriculum Courses" },
  // Other campuses
  { code: "BP", fullname: "Puncak Alam" },
  { code: "BM", fullname: "Bandaraya Melaka" },
  { code: "JP", fullname: "Johor Pasir Gudang" },
  { code: "JB", fullname: "Johor Segamat" },
  { code: "KE", fullname: "Kelantan Machang" },
  { code: "KS", fullname: "Kedah Sungai Petani" },
  { code: "KT", fullname: "Terengganu Dungun" },
  { code: "ML", fullname: "Melaka Alor Gajah" },
  { code: "NS", fullname: "Negeri Sembilan Seremban" },
  { code: "P",  fullname: "Perak Tapah" },
  { code: "PB", fullname: "Pahang Jengka" },
  { code: "PE", fullname: "Penang Bukit Mertajam" },
  { code: "PP", fullname: "Pulau Pinang" },
  { code: "SA", fullname: "Sabah Kota Kinabalu" },
  { code: "SB", fullname: "Sarawak Kota Samarahan" },
  { code: "SR", fullname: "Sarawak Mukah" },
  { code: "T",  fullname: "Terengganu Kuala Terengganu" },
];

/** Campus codes that don't require a faculty selection. */
export const NO_FACULTY_CAMPUS_CODES = new Set(["HEP", "APB", "CITU"]);

export const FALLBACK_FACULTIES: Faculty[] = [
  { code: "AD", fullname: "Administrative Science & Policy Studies" },
  { code: "AM", fullname: "Applied Sciences" },
  { code: "AP", fullname: "Architecture, Planning & Surveying" },
  { code: "AR", fullname: "Art & Design" },
  { code: "AS", fullname: "Accountancy" },
  { code: "BM", fullname: "Business Management" },
  { code: "CD", fullname: "Computer & Mathematical Sciences" },
  { code: "CS", fullname: "Computer Science & Mathematics" },
  { code: "DA", fullname: "Data Science & Information Technology" },
  { code: "EE", fullname: "Electrical Engineering" },
  { code: "EN", fullname: "Engineering" },
  { code: "FS", fullname: "Sports Science & Recreation" },
  { code: "HM", fullname: "Hotel & Tourism Management" },
  { code: "IS", fullname: "Information Management" },
  { code: "LA", fullname: "Law" },
  { code: "MC", fullname: "Mass Communication" },
  { code: "ME", fullname: "Mechanical Engineering" },
  { code: "PA", fullname: "Pharmacy" },
  { code: "PE", fullname: "Education" },
  { code: "PL", fullname: "Plantation & Agrotechnology" },
  { code: "PN", fullname: "Nursing" },
];

// ---------------------------------------------------------------------------
/** Subject color palette — one color per index (hue spaced evenly, consistent across sessions). */
export const SUBJECT_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-900/40", border: "border-blue-300 dark:border-blue-700", text: "text-blue-800 dark:text-blue-200" },
  { bg: "bg-emerald-100 dark:bg-emerald-900/40", border: "border-emerald-300 dark:border-emerald-700", text: "text-emerald-800 dark:text-emerald-200" },
  { bg: "bg-violet-100 dark:bg-violet-900/40", border: "border-violet-300 dark:border-violet-700", text: "text-violet-800 dark:text-violet-200" },
  { bg: "bg-amber-100 dark:bg-amber-900/40", border: "border-amber-300 dark:border-amber-700", text: "text-amber-800 dark:text-amber-200" },
  { bg: "bg-rose-100 dark:bg-rose-900/40", border: "border-rose-300 dark:border-rose-700", text: "text-rose-800 dark:text-rose-200" },
  { bg: "bg-cyan-100 dark:bg-cyan-900/40", border: "border-cyan-300 dark:border-cyan-700", text: "text-cyan-800 dark:text-cyan-200" },
  { bg: "bg-orange-100 dark:bg-orange-900/40", border: "border-orange-300 dark:border-orange-700", text: "text-orange-800 dark:text-orange-200" },
  { bg: "bg-teal-100 dark:bg-teal-900/40", border: "border-teal-300 dark:border-teal-700", text: "text-teal-800 dark:text-teal-200" },
] as const;

export type SubjectColor = (typeof SUBJECT_COLORS)[number];

/** Assign a stable color to a subject key (section or course code). */
export function getSubjectColor(key: string): SubjectColor {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) & 0xffff;
  }
  return SUBJECT_COLORS[hash % SUBJECT_COLORS.length];
}

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

/** Timetable visible hours — 07:00 to 22:00 */
export const HOUR_START = 7;
export const HOUR_END = 22;
