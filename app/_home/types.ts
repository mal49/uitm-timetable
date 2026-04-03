import type { MyStudentImportResult } from "@/lib/importers/mystudent";
import type { GroupedTimetable, SearchRequest } from "@/lib/types";

export type ViewMode = "grid" | "table";

export type ItemStatus =
  | "loading_subjects"
  | "choose_subject"
  | "loading_timetable"
  | "ready"
  | "error";

export type SubjectMatch = {
  subject: string;
  path: string;
};

export type SubjectItem = {
  id: string;
  source: "search" | "mystudent";
  request?: SearchRequest;
  course: string;
  status: ItemStatus;
  error?: string;
  matches: SubjectMatch[];
  selectedPath?: string;
  subjectName?: string;
  grouped?: GroupedTimetable;
  selectedGroup: string | null;
  groupFilter: string;
  showSelectedOnly: boolean;
  importedAt?: string;
  exportedAt?: string;
};

export type SavedImportState = MyStudentImportResult | null;
