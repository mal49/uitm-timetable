import { toBlob } from "html-to-image";
import { useEffect, useRef, useState } from "react";
import { fetchSubjects, fetchTimetableByPath } from "@/app/_home/api";
import { IMPORT_STORAGE_KEY } from "@/app/_home/constants";
import type { SavedImportState, SubjectItem, ViewMode } from "@/app/_home/types";
import {
  buildSubjectItemsFromImport,
  buildCombinedEntries,
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
import type { SearchRequest } from "@/lib/types";

export function useHomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [items, setItems] = useState<SubjectItem[]>([]);
  const [adding, setAdding] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [exportError, setExportError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [showClashesOnly, setShowClashesOnly] = useState(false);
  const [subjectColorOverrides, setSubjectColorOverrides] = useState<
    Record<string, string>
  >({});
  const [subjectColorDrafts, setSubjectColorDrafts] = useState<
    Record<string, string>
  >({});
  const [savedImport, setSavedImport] = useState<SavedImportState>(null);

  const timetableRef = useRef<HTMLDivElement | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);

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

      setSavedImport(parsed);
      setItems((prev) => {
        if (prev.some((item) => item.source === "mystudent")) return prev;
        return [...buildSubjectItemsFromImport(parsed), ...prev];
      });
    } catch {
      // Ignore corrupted local data and allow a fresh import.
    }
  }, []);

  async function handleAddSubject(data: SearchRequest) {
    setGlobalError("");
    setAdding(true);

    const id = makeId();
    const course = data.course.trim().toUpperCase();

    const newItem: SubjectItem = {
      id,
      source: "search",
      request: { ...data, course },
      course,
      status: "loading_subjects",
      matches: [],
      selectedGroup: null,
      groupFilter: "",
      showSelectedOnly: false,
    };

    setItems((prev) => [newItem, ...prev]);

    try {
      const subjects = await fetchSubjects({ ...data, course });
      const matches = subjects.results ?? [];

      if (matches.length === 0) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "error",
                  error: "No matching subject results found.",
                }
              : item,
          ),
        );
        return;
      }

      if (matches.length === 1) {
        const only = matches[0]!;
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  matches,
                  selectedPath: only.path,
                  subjectName: only.subject || course,
                  status: "loading_timetable",
                }
              : item,
          ),
        );

        const timetable = await fetchTimetableByPath({
          path: only.path,
          course,
          subject: only.subject || course,
        });

        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, grouped: timetable.grouped, status: "ready" }
              : item,
          ),
        );
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, matches, status: "choose_subject" } : item,
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setGlobalError(message);
    } finally {
      setAdding(false);
    }
  }

  async function handleChooseMatch(itemId: string, path: string) {
    const item = items.find((entry) => entry.id === itemId);
    const match = item?.matches.find((entry) => entry.path === path);
    const course = item?.course ?? "";
    const subject = match?.subject || course;

    setItems((prev) =>
      prev.map((entry) =>
        entry.id === itemId
          ? {
              ...entry,
              selectedPath: path,
              subjectName: subject,
              status: "loading_timetable",
              error: undefined,
            }
          : entry,
      ),
    );

    try {
      const timetable = await fetchTimetableByPath({ path, course, subject });
      setItems((prev) =>
        prev.map((entry) =>
          entry.id === itemId
            ? { ...entry, grouped: timetable.grouped, status: "ready" }
            : entry,
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setItems((prev) =>
        prev.map((entry) =>
          entry.id === itemId
            ? { ...entry, status: "error", error: message }
            : entry,
        ),
      );
    }
  }

  function selectGroup(itemId: string, group: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, selectedGroup: group } : item,
      ),
    );
  }

  function clearGroups(itemId: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, selectedGroup: null } : item,
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

  function toggleShowSelectedOnly(itemId: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, showSelectedOnly: !item.showSelectedOnly }
          : item,
      ),
    );
  }

  function removeItem(itemId: string) {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
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

    setSubjectColorDrafts((prev) => ({
      ...prev,
      [course]: subjectColorOverrides[course] ?? "",
    }));
  }

  function handleConfirmMyStudentImport(result: MyStudentImportResult) {
    const importedItems = buildSubjectItemsFromImport(result);
    setSavedImport(result);
    setGlobalError("");
    setItems((prev) => [
      ...importedItems,
      ...prev.filter((item) => item.source !== "mystudent"),
    ]);

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

    const node = exportRef.current ?? timetableRef.current;
    if (!node) {
      setExportError("Nothing to export yet.");
      return;
    }

    try {
      setExporting(true);

      const bodyBg =
        typeof window !== "undefined"
          ? window.getComputedStyle(document.body).backgroundColor
          : "";
      const backgroundColor =
        bodyBg && bodyBg !== "rgba(0, 0, 0, 0)" ? bodyBg : "#ffffff";

      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      const baseName = `uitm-class-canvas-${stamp}-${viewMode}`;

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

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
        link.download = `${baseName}.jpg`;
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

  const combinedEntries = markClashes(buildCombinedEntries(items));
  const displayedEntries = showClashesOnly
    ? combinedEntries.filter((entry) => entry.isClash)
    : combinedEntries;
  const clashCount = combinedEntries.filter((entry) => entry.isClash).length;

  return {
    viewMode,
    setViewMode,
    items,
    adding,
    globalError,
    exportError,
    exporting,
    showClashesOnly,
    setShowClashesOnly,
    subjectColorOverrides,
    subjectColorDrafts,
    timetableRef,
    exportRef,
    combinedEntries,
    displayedEntries,
    clashCount,
    savedImport,
    handleAddSubject,
    handleConfirmMyStudentImport,
    handleRestoreSavedImport,
    handleClearSavedImport,
    handleChooseMatch,
    selectGroup,
    clearGroups,
    setGroupFilter,
    toggleShowSelectedOnly,
    removeItem,
    setSubjectColor,
    setSubjectColorDraft,
    commitSubjectColorDraft,
    exportTimetable,
    groupKeys,
    formatImportTimestampLabel,
  };
}
