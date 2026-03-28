import type { Campus, Faculty } from "./types";

// ---------------------------------------------------------------------------
// Fallback lists — used when the /api/campuses or /api/faculties calls fail.
// These are the most common UiTM campuses and faculties.
// ---------------------------------------------------------------------------

export const FALLBACK_CAMPUSES: Campus[] = [
  { code: "B", fullname: "Selangor Campus" },
  { code: "APB", fullname: "Selangor Campus - Language Courses" },
  { code: "CITU", fullname: "Selangor Campus - CITU Courses" },
  { code: "HEP", fullname: "Selangor Campus - Co-Curriculum Courses" },
  { code: "A", fullname: "A - UiTM Kampus Seri Iskandar" },
  { code: "A4", fullname: "A4 - UiTM Kampus Tapah" },
  { code: "B10", fullname: "B10 - UiTM Kampus Dengkil" },
  { code: "C", fullname: "C - UiTM Kampus Jengka" },
  { code: "C3", fullname: "C3 - UiTM Kampus Raub" },
  { code: "D", fullname: "D - UiTM Kampus Machang" },
  { code: "D2", fullname: "D2 - UiTM Kampus Kota Bharu" },
  { code: "FAB", fullname: "FAB - Kolej Widad" },
  { code: "FC", fullname: "FC - Kolej Yayasan Pahang" },
  { code: "FEW", fullname: "FEW - East West International College" },
  { code: "FFE", fullname: "FFE - Kolej Felcra" },
  { code: "FJ", fullname: "FJ - Kolej Islam Yayasan Pelajaran Johor" },
  { code: "FJA", fullname: "FJA - Institut Sains Dan Tek. Darul Takzim" },
  { code: "FL", fullname: "FL - Ins. Profesional Baitulmal Kuala Lumpur" },
  { code: "FM", fullname: "FM - Kolej Antarabangsa Unifield" },
  { code: "FMA", fullname: "FMA - Melaka Inter. College of Science & Tech." },
  { code: "FMM", fullname: "FMM - Malaysian Consortium For Edu. Mauritius" },
  { code: "FN", fullname: "FN - Kolej Uniti" },
  { code: "FQ", fullname: "FQ - Kolej SATT" },
  { code: "FQI", fullname: "FQI - Qaiwan International University" },
  { code: "J", fullname: "J - UiTM Kampus Segamat" },
  { code: "J4", fullname: "J4 - UiTM Kampus Pasir Gudang" },
  { code: "K", fullname: "K - UiTM Kampus Sungai Petani" },
  { code: "M", fullname: "M - UiTM Kampus Alor Gajah" },
  { code: "M1", fullname: "M1 - UiTM Kampus Bandaraya Melaka" },
  { code: "M3", fullname: "M3 - UiTM Kampus Jasin" },
  { code: "N", fullname: "N - UiTM Kampus Kuala Pilah" },
  { code: "N3", fullname: "N3 - UiTM Kampus Kuala Pilah" },
  { code: "N4", fullname: "N4 - UiTM Kampus Seremban 3" },
  { code: "N5", fullname: "N5 - UiTM Kampus Rembau" },
  { code: "P", fullname: "P - UiTM Kampus Bukit Mertajam" },
  { code: "P2", fullname: "P2 - UiTM Kampus Bertam" },
  { code: "P4", fullname: "P4 - UiTM Kampus Permatang Pauh" },
  { code: "Q", fullname: "Q - UiTM Kampus Samarahan" },
  { code: "Q5", fullname: "Q5 - UiTM Kampus Samarahan 2" },
  { code: "Q6", fullname: "Q6 - UiTM Kampus Mukah" },
  { code: "R", fullname: "R - UiTM Kampus Arau" },
  { code: "S", fullname: "S - UiTM Kampus Kota Kinabalu" },
  { code: "S2", fullname: "S2 - UiTM Kampus Tawau" },
  { code: "T", fullname: "T - UiTM Kampus Dungun" },
  { code: "T4", fullname: "T4 - UiTM Kampus Bukit Besi" },
  { code: "T5", fullname: "T5 - UiTM Kampus Kuala Terengganu (Cendering)" },
];

/** Campus codes that use the Shah Alam special-course buckets. */
export const SHAH_ALAM_SPECIAL_CAMPUS_CODES = new Set(["HEP", "APB", "CITU"]);

/** Known course-prefix hints for Shah Alam special buckets. */
export const SHAH_ALAM_SPECIAL_COURSE_PREFIXES: Record<string, readonly string[]> = {
  APB: [
    "ELC",
    "EWC",
    "TAC",
    "TMC",
    "TJC",
    "TFC",
    "TGC",
    "TKC",
    "TBC",
    "TIC",
  ],
  CITU: ["CTU"],
  HEP: ["HBU", "HKS", "HKA", "HKK", "HKB"],
};

/** Faculty selection is only required by the upstream form for Selangor campus. */
export const FACULTY_REQUIRED_CAMPUS_CODES = new Set(["B"]);

export const FALLBACK_FACULTIES: Faculty[] = [
  { code: "AA", fullname: "AA - ARSHAD AYUB GRADUATE BUSINESS SCHOOL" },
  { code: "AC", fullname: "AC - FACULTY OF ACCOUNTANCY" },
  { code: "AD", fullname: "AD - FACULTY OF ART AND DESIGN" },
  { code: "AM", fullname: "AM - FACULTY OF ADMINISTRATIVE SCIENCE AND POLICY STUDIES" },
  { code: "AP", fullname: "AP - FACULTY OF ARCHITECTURE, PLANNING AND SURVEYING" },
  { code: "AS", fullname: "AS - FACULTY OF APPLIED SCIENCES" },
  { code: "BA", fullname: "BA - FACULTY OF BUSINESS AND MANAGEMENT" },
  { code: "BE", fullname: "BE - FACULTY OF BUILT ENVIRONMENT" },
  { code: "BM", fullname: "BM - FACULTY OF BUSINESS MANAGEMENT" },
  { code: "CA", fullname: "CA - COLLEGE OF CREATIVE ARTS" },
  { code: "CD", fullname: "CD - COLLEGE OF COMPUTING, INFORMATICS AND MATHEMATICS" },
  { code: "CE", fullname: "CE - COLLEGE OF ENGINEERING" },
  { code: "CF", fullname: "CF - COLLEGE OF BUILT ENVIRONMENT" },
  { code: "CP", fullname: "CP - INSTI OF CONTINUING EDUCATION & PROFESSIONAL STUDIES" },
  { code: "CS", fullname: "CS - FACULTY OF COMPUTER AND MATHEMATICAL SCIENCES" },
  { code: "DS", fullname: "DS - FACULTY OF DENTISTRY" },
  { code: "EC", fullname: "EC - FACULTY OF CIVIL ENGINEERING" },
  { code: "ED", fullname: "ED - FACULTY OF EDUCATION" },
  { code: "EE", fullname: "EE - FACULTY OF ELECTRICAL ENGINEERING" },
  { code: "EH", fullname: "EH - FACULTY OF CHEMICAL ENGINEERING" },
  { code: "EM", fullname: "EM - FACULTY OF MECHANICAL ENGINEERING" },
  { code: "FF", fullname: "FF - FACULTY OF FILM, THEATRE AND ANIMATION" },
  { code: "HM", fullname: "HM - FACULTY OF HOTEL AND TOURISM MANAGEMENT" },
  { code: "HS", fullname: "HS - FACULTY OF HEALTH SCIENCES" },
  { code: "IC", fullname: "IC - ACADEMY OF CONTEMPORARY ISLAMIC STUDIES" },
  { code: "IM", fullname: "IM - FACULTY OF INFORMATION MANAGEMENT" },
  { code: "IN", fullname: "IN - INTERNATIONAL" },
  { code: "LG", fullname: "LG - ACADEMY OF LANGUAGE STUDIES" },
  { code: "LT", fullname: "LT - MALAYSIA INSTITUTE OF TRANSPORT" },
  { code: "LW", fullname: "LW - FACULTY OF LAW" },
  { code: "MC", fullname: "MC - FACULTY OF COMMUNICATION AND MEDIA STUDIES" },
  { code: "MD", fullname: "MD - FACULTY OF MEDICINE" },
  { code: "MU", fullname: "MU - FACULTY OF MUSIC" },
  { code: "PH", fullname: "PH - FACULTY OF PHARMACY" },
  { code: "SI", fullname: "SI - FACULTY OF INFORMATION SCIENCE" },
  { code: "SR", fullname: "SR - FACULTY OF SPORTS SCIENCE AND RECREATION" },
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
