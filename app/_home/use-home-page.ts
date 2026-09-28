import { toBlob } from "html-to-image";
import { useEffect, useMemo, useRef, useState } from "react";
import { IMPORT_STORAGE_KEY, PRESET_SUBJECT_HEX } from "@/app/_home/constants";
import type { SavedImportState, SubjectItem, ViewMode } from "@/app/_home/types";
import {
  buildSubjectItemsFromImport,
  buildCombinedEntries,
  clashingCourse,
  findClashPairs,
  formatImportTimestampLabel,
  groupKeys,
  makeId,
  markClashes,
  normalizeHexColor,
} from "@/app/_home/utils";
import {
  MYSTUDENT_IMPORT_SOURCE,
  type MyStudentImportResult,
} from "@/lib/importers/mystudent";
import type { GroupedTimetable, SearchRequest } from "@/lib/types";

export const STEPS = ["Import", "Subjects", "Canvas", "Wallpaper"] as const;
export type Step = 0 | 1 | 2 | 3;

export type SearchedSubject = {
  request: SearchRequest;
  course: string;
  subjectName: string;
  path: string;
  grouped: GroupedTimetable;
  selectedGroup: string;
};

export function useHomePage() {
  const [step, setStep] = useState<Step>(0);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [items, setItems] = useState<SubjectItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [exportError, setExportError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [subjectColorOverrides, setSubjectColorOverrides] = useState<
    Record<string, string>
  >({});
  const [subjectColorDrafts, setSubjectColorDrafts] = useState<
    Record<string, string>
  >({});
  const [savedImport, setSavedImport] = useState<SavedImportState>(null);

  const timetableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(IMPORT_STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored) as MyStudentImportResult;
      if (
        parsed?.source !== MYSTUDENT_IMPORT_SOURCE ||
        !Array.isArray(parsed.subjects) ||
        parsed.subjects.length === 0
      ) {
        return;
      }

      // Offered as "Welcome back" on the import step rather than auto-restored.
      setSavedImport(parsed);
    } catch {
      // Ignore corrupted local data and allow a fresh import.
    }
  }, []);

  function addSearchedSubject(subject: SearchedSubject) {
    setItems((prev) => [
      ...prev.filter((item) => item.selectedPath !== subject.path),
      {
        id: makeId(),
        source: "search",
        request: subject.request,
        course: subject.course,
        status: "ready",
        matches: [],
        selectedPath: subject.path,
        subjectName: subject.subjectName,
        grouped: subject.grouped,
        selectedGroup: subject.selectedGroup,
        groupFilter: "",
        showSelectedOnly: false,
      },
    ]);
  }

  function selectGroup(itemId: string, group: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, selectedGroup: group } : item,
      ),
    );
  }

  function setGroupFilter(itemId: string, value: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, groupFilter: value } : item,
      ),
    );
  }

  function removeItem(itemId: string) {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  function clearAll() {
    setItems([]);
    setExpandedId(null);
  }

  /** Jump to the Subjects step with one subject opened (used from the canvas). */
  function focusSubject(course: string) {
    setExpandedId(items.find((item) => item.course === course)?.id ?? null);
    setStep(1);
  }

  function setSubjectColor(course: string, hexColor: string) {
    const normalized = normalizeHexColor(hexColor);
    if (!normalized) return;

    setSubjectColorOverrides((prev) => ({ ...prev, [course]: normalized }));
    setSubjectColorDrafts((prev) => ({ ...prev, [course]: normalized }));
  }

  function setSubjectColorDraft(course: string, value: string) {
    setSubjectColorDrafts((prev) => ({ ...prev, [course]: value }));
  }

  function commitSubjectColorDraft(course: string) {
    const normalized = normalizeHexColor(subjectColorDrafts[course] ?? "");
    if (normalized) {
      setSubjectColor(course, normalized);
      return;
    }

    setSubjectColorDrafts((prev) => {
      const next = { ...prev };
      delete next[course];
      return next;
    });
  }

  function handleConfirmMyStudentImport(result: MyStudentImportResult) {
    const importedItems = buildSubjectItemsFromImport(result);
    setSavedImport(result);
    setItems((prev) => [
      ...importedItems,
      ...prev.filter((item) => item.source !== "mystudent"),
    ]);
    setStep(1);

    try {
      window.localStorage.setItem(IMPORT_STORAGE_KEY, JSON.stringify(result));
    } catch {
      // Ignore localStorage quota/write failures.
    }
  }

  function handleRestoreSavedImport() {
    if (!savedImport) return;

    setItems((prev) => [
      ...buildSubjectItemsFromImport(savedImport),
      ...prev.filter((item) => item.source !== "mystudent"),
    ]);
    setStep(1);
  }

  function handleClearSavedImport() {
    setSavedImport(null);
    setItems((prev) => prev.filter((item) => item.source !== "mystudent"));

    try {
      window.localStorage.removeItem(IMPORT_STORAGE_KEY);
    } catch {
      // Ignore localStorage failures.
    }
  }

  async function exportTimetable() {
    setExportError("");

    const node = timetableRef.current;
    if (!node) {
      setExportError("Nothing to export yet.");
      return;
    }

    try {
      setExporting(true);

      const backgroundColor =
        window.getComputedStyle(document.body).backgroundColor || "#000000";
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

      const blob = await toBlob(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor,
        skipFonts: true,
        type: "image/jpeg",
        quality: 0.95,
      });

      if (!blob) throw new Error("Failed to render JPG image.");

      const url = URL.createObjectURL(blob);
      try {
        const link = document.createElement("a");
        link.download = `uitm-class-canvas-${stamp}-${viewMode}.jpg`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } finally {
        window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setExportError(message || "Failed to export timetable.");
    } finally {
      setExporting(false);
    }
  }

  const combinedEntries = useMemo(
    () => markClashes(buildCombinedEntries(items)),
    [items],
  );
  const clashPairs = findClashPairs(combinedEntries);

  const subjectColors = useMemo(
    () =>
      Object.fromEntries(
        items.map((item, index) => [
          item.course,
          subjectColorOverrides[item.course] ??
            PRESET_SUBJECT_HEX[index % PRESET_SUBJECT_HEX.length]!,
        ]),
      ),
    [items, subjectColorOverrides],
  );

  // First clashing subject that has a clash-free alternative group.
  let clashFix: { itemId: string; course: string; group: string } | null = null;
  for (const item of items) {
    if (clashFix || !item.grouped || !item.selectedGroup) continue;
    const others = combinedEntries.filter((entry) => entry.course !== item.course);
    if (!clashingCourse(item.grouped[item.selectedGroup] ?? [], others)) continue;
    const group = groupKeys(item.grouped).find(
      (key) => !clashingCourse(item.grouped![key] ?? [], others),
    );
    if (group) clashFix = { itemId: item.id, course: item.course, group };
  }

  return {
    step,
    setStep,
    viewMode,
    setViewMode,
    items,
    expandedId,
    setExpandedId,
    exportError,
    exporting,
    subjectColors,
    subjectColorOverrides,
    subjectColorDrafts,
    timetableRef,
    combinedEntries,
    clashPairs,
    clashFix,
    savedImport,
    addSearchedSubject,
    handleConfirmMyStudentImport,
    handleRestoreSavedImport,
    handleClearSavedImport,
    selectGroup,
    setGroupFilter,
    removeItem,
    clearAll,
    focusSubject,
    setSubjectColor,
    setSubjectColorDraft,
    commitSubjectColorDraft,
    exportTimetable,
    formatImportTimestampLabel,
  };
}

export type HomePageState = ReturnType<typeof useHomePage>;
