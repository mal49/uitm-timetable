"use client";

import { toBlob } from "html-to-image";
import { useRef, useState } from "react";
import {
  LayoutGrid,
  List,
  AlertCircle,
  CalendarX2,
  GraduationCap,
  Plus,
  Trash2,
  Wand2,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/search-form";
import { TimetableGrid, TimetableGridSkeleton } from "@/components/timetable-grid";
import { TimetableTable } from "@/components/timetable-table";
import { ThemeToggle } from "@/components/theme-toggle";
import { WallpaperMaker } from "@/components/wallpaper-maker-v2/wallpaper-maker";
import { Input } from "@/components/ui/input";
import { SiteFooter } from "@/components/site-footer";
import type {
  GroupedTimetable,
  SearchRequest,
  SubjectsResponse,
  TimetableByPathResponse,
  TimetableEntry,
} from "@/lib/types";

type ViewMode = "grid" | "table";
type ItemStatus = "loading_subjects" | "choose_subject" | "loading_timetable" | "ready" | "error";

type SubjectMatch = { subject: string; path: string };

type SubjectItem = {
  id: string;
  request: SearchRequest;
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
};

const PRESET_SUBJECT_HEX = [
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#f43f5e",
  "#06b6d4",
  "#f97316",
  "#14b8a6",
] as const;

function makeId() {
  return Math.random().toString(16).slice(2);
}

function groupKeys(grouped?: GroupedTimetable) {
  return Object.keys(grouped ?? {}).sort();
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function entryKey(e: TimetableEntry) {
  return [
    e.subjectKey ?? "",
    e.course ?? "",
    e.section ?? "",
    e.day,
    e.start,
    e.end,
    e.venue,
    e.lecturer ?? "",
  ].join("|");
}

function findClashingEntryKeys(entries: TimetableEntry[]) {
  const byDay = new Map<string, TimetableEntry[]>();
  for (const e of entries) {
    const day = e.day ?? "";
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(e);
  }

  const clashes = new Set<string>();

  for (const [, dayEntries] of byDay) {
    const sorted = [...dayEntries].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

    for (let i = 0; i < sorted.length; i++) {
      const a = sorted[i]!;
      const aStart = timeToMinutes(a.start);
      let aEnd = timeToMinutes(a.end);

      for (let j = i + 1; j < sorted.length; j++) {
        const b = sorted[j]!;
        const bStart = timeToMinutes(b.start);
        const bEnd = timeToMinutes(b.end);

        // since sorted by start time, no further overlaps possible
        if (bStart >= aEnd) break;

        const overlap = aStart < bEnd && bStart < aEnd;
        if (overlap) {
          clashes.add(entryKey(a));
          clashes.add(entryKey(b));
        }

        // extend aEnd to cover chains like A overlaps B, B overlaps C
        // so we keep detecting overlaps against the widest interval so far
        if (bEnd > aEnd) {
          aEnd = bEnd;
        }
      }
    }
  }

  return clashes;
}

function normalizeHexColor(value: string) {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return /^#[0-9a-fA-F]{6}$/.test(withHash) ? withHash.toLowerCase() : null;
}

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [items, setItems] = useState<SubjectItem[]>([]);
  const [adding, setAdding] = useState(false);
  const [globalError, setGlobalError] = useState<string>("");
  const [exportError, setExportError] = useState<string>("");
  const [exporting, setExporting] = useState(false);
  const [showClashesOnly, setShowClashesOnly] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestMsg, setSuggestMsg] = useState<string>("");
  const [subjectColorOverrides, setSubjectColorOverrides] = useState<Record<string, string>>({});
  const [subjectColorDrafts, setSubjectColorDrafts] = useState<Record<string, string>>({});

  const timetableRef = useRef<HTMLDivElement | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);
  // Export captures an off-screen, fixed-width desktop tree so JPGs never rely on mobile layout.

  async function fetchSubjects(request: SearchRequest) {
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const json = (await res.json()) as SubjectsResponse & { error?: string };
    if (!res.ok) throw new Error(json.error ?? "Failed to fetch subjects.");
    return json;
  }

  async function fetchTimetableByPath(payload: { path: string; course: string; subject: string }) {
    const res = await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as TimetableByPathResponse & { error?: string };
    if (!res.ok) throw new Error(json.error ?? "Failed to fetch timetable.");
    return json;
  }

  async function handleAddSubject(data: SearchRequest) {
    setGlobalError("");
    setAdding(true);

    const id = makeId();
    const course = data.course.trim().toUpperCase();

    const newItem: SubjectItem = {
      id,
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
      const matches = (subjects.results ?? []) as SubjectMatch[];

      if (matches.length === 0) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === id ? { ...it, status: "error", error: "No matching subject results found." } : it
          )
        );
        return;
      }

      if (matches.length === 1) {
        const only = matches[0]!;
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? {
                  ...it,
                  matches,
                  selectedPath: only.path,
                  subjectName: only.subject || course,
                  status: "loading_timetable",
                }
              : it
          )
        );

        const ttb = await fetchTimetableByPath({
          path: only.path,
          course,
          subject: only.subject || course,
        });

        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, grouped: ttb.grouped, status: "ready" } : it))
        );
        return;
      }

      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, matches, status: "choose_subject" } : it)));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setItems((prev) => prev.filter((it) => it.id !== id));
      setGlobalError(msg);
    } finally {
      setAdding(false);
    }
  }

  async function handleChooseMatch(itemId: string, path: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const match = it.matches.find((m) => m.path === path);
        return {
          ...it,
          selectedPath: path,
          subjectName: match?.subject || it.course,
          status: "loading_timetable",
          error: undefined,
        };
      })
    );

    const item = items.find((it) => it.id === itemId);
    const match = item?.matches.find((m) => m.path === path);
    const course = item?.course ?? "";
    const subject = match?.subject || course;

    try {
      const ttb = await fetchTimetableByPath({ path, course, subject });
      setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, grouped: ttb.grouped, status: "ready" } : it)));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, status: "error", error: msg } : it)));
    }
  }

  function selectGroup(itemId: string, group: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        return { ...it, selectedGroup: group };
      })
    );
  }

  function setGroupFilter(itemId: string, value: string) {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, groupFilter: value } : it)));
  }

  function toggleShowSelectedOnly(itemId: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, showSelectedOnly: !it.showSelectedOnly } : it))
    );
  }

  function clearGroups(itemId: string) {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, selectedGroup: null } : it)));
  }

  function removeItem(itemId: string) {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  }

  function setSubjectColor(course: string, hexColor: string) {
    const normalized = normalizeHexColor(hexColor);
    if (!normalized) return;
    setSubjectColorOverrides((prev) => ({ ...prev, [course]: normalized }));
    setSubjectColorDrafts((prev) => ({ ...prev, [course]: normalized }));
  }

  async function exportTimetable() {
    setExportError("");
    // Always export using a fixed-width, desktop-layout tree (even on mobile).
    // This avoids narrow/mobile layout captures that look broken when saved.
    const node = exportRef.current ?? timetableRef.current;
    if (!node) {
      setExportError("Nothing to export yet.");
      return;
    }

    try {
      setExporting(true);

      // html-to-image supports `backgroundColor` so JPG never ends up transparent.
      const bodyBg = typeof window !== "undefined" ? window.getComputedStyle(document.body).backgroundColor : "";
      const backgroundColor = bodyBg && bodyBg !== "rgba(0, 0, 0, 0)" ? bodyBg : "#ffffff";

      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      const baseName = `uitm-timetable-${stamp}-${viewMode}`;

      const common = {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor,
        // Avoid html-to-image font embedding crashes when a font is missing/undefined.
        skipFonts: true,
      };

      // Wait one frame so off-screen export tree has laid out (especially on mobile).
      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      const blob = await toBlob(node, { ...common, type: "image/jpeg", quality: 0.95 });
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
        // Revoke after a short delay so the download has time to start.
        // Immediate revocation can occasionally result in a broken/empty file.
        window.setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1500);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setExportError(msg || "Failed to export timetable.");
    } finally {
      setExporting(false);
    }
  }

  async function handleSuggestCombo() {
    setSuggestMsg("");
    setSuggesting(true);

    try {
      const ready = items
        .filter((it) => it.status === "ready" && it.grouped)
        .map((it) => ({
          id: it.id,
          course: it.course,
          subjectName: it.subjectName || it.course,
          grouped: it.grouped as GroupedTimetable,
          groups: groupKeys(it.grouped),
        }))
        .filter((it) => it.groups.length > 0);

      if (ready.length < 2) {
        setSuggestMsg("Add at least 2 ready subjects to suggest a combo.");
        return;
      }

      const ordered = [...ready].sort((a, b) => a.groups.length - b.groups.length);
      const startedAt = performance.now();
      const BUDGET_MS = 450;

      let bestScore = Number.POSITIVE_INFINITY;
      let bestSelection: Record<string, string> | null = null;

      function buildEntriesFor(subject: (typeof ordered)[number], group: string): TimetableEntry[] {
        const entries = subject.grouped[group] ?? [];
        return entries.map((e) => ({
          ...e,
          course: subject.course,
          subjectName: subject.subjectName,
          subjectKey: subject.course,
          section: `${subject.course} ${group}`.trim(),
        }));
      }

      function score(entries: TimetableEntry[]) {
        return findClashingEntryKeys(entries).size;
      }

      function recurse(
        idx: number,
        currentEntries: TimetableEntry[],
        selection: Record<string, string>
      ) {
        if (performance.now() - startedAt > BUDGET_MS) return;
        if (idx >= ordered.length) {
          const s = score(currentEntries);
          if (s < bestScore) {
            bestScore = s;
            bestSelection = { ...selection };
          }
          return;
        }

        const subject = ordered[idx]!;
        for (const group of subject.groups) {
          const nextEntries = currentEntries.concat(buildEntriesFor(subject, group));
          const partial = score(nextEntries);
          if (partial >= bestScore) continue;
          recurse(idx + 1, nextEntries, { ...selection, [subject.id]: group });
          if (bestScore === 0) return;
        }
      }

      recurse(0, [], {});

      if (!bestSelection) {
        setSuggestMsg("Couldn’t find a suggestion. Try selecting some groups manually first.");
        return;
      }

      setItems((prev) =>
        prev.map((it) => {
          const chosen = bestSelection?.[it.id];
          if (!chosen) return it;
          return { ...it, selectedGroup: chosen };
        })
      );

      setSuggestMsg(
        bestScore === 0
          ? "Found a clash-free combination."
          : `Suggested a combination with ${bestScore} clash${bestScore !== 1 ? "es" : ""}.`
      );
    } finally {
      setSuggesting(false);
    }
  }

  const baseCombinedEntries: TimetableEntry[] = items.flatMap((it) => {
    if (!it.grouped) return [];
    const course = it.course;
    const subjectName = it.subjectName || course;
    const g = it.selectedGroup;
    if (!g) return [];
    const entries = it.grouped[g] ?? [];
    return entries.map((e) => ({
      ...e,
      course,
      subjectName,
      subjectKey: course,
      section: `${course} ${g}`.trim(),
    }));
  });

  const clashKeys = findClashingEntryKeys(baseCombinedEntries);
  const combinedEntries = baseCombinedEntries.map((e) => ({
    ...e,
    isClash: clashKeys.has(entryKey(e)),
  }));

  const displayedEntries = showClashesOnly ? combinedEntries.filter((e) => e.isClash) : combinedEntries;
  const clashCount = combinedEntries.filter((e) => e.isClash).length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Off-screen export tree (desktop width). */}
      {combinedEntries.length > 0 ? (
        <div
          aria-hidden="true"
          className="fixed left-[-10000px] top-0 pointer-events-none opacity-0"
        >
          <div
            ref={exportRef}
            // 1200px matches the app's comfortable desktop width and yields a horizontal JPG.
            style={{ width: 1200 }}
            className="bg-background p-4"
          >
            {viewMode === "grid" ? (
              <TimetableGrid
                entries={displayedEntries}
                course="MY"
                layoutDesktop
                colorOverrides={subjectColorOverrides}
              />
            ) : (
              <div className="w-full">
                <TimetableTable entries={displayedEntries} course="MY" colorOverrides={subjectColorOverrides} />
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 h-12 sm:h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-xs sm:text-sm tracking-tight">UiTM Timetable</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10 space-y-6 sm:space-y-8">

        {/* Hero */}
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Build Your Timetable
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-xl">
            Add your subjects, pick the right timetable result, then select your groups to build a custom schedule.
          </p>
        </div>

        {/* Add subject */}
        <div className="rounded-lg sm:rounded-xl border border-border bg-card p-4 sm:p-5 md:p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3 sm:gap-4 flex-col sm:flex-row">
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-foreground">Add a subject</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Use the same campus/faculty for your current semester, then add multiple course codes.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Plus className="h-3.5 w-3.5" />
              Add as many as you want
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <SearchForm onSubmit={handleAddSubject} isLoading={adding} />
          </div>
        </div>

        {globalError && (
          <div className="rounded-lg sm:rounded-xl border border-destructive/40 bg-destructive/5 px-4 sm:px-5 py-4 sm:py-6 flex items-start gap-3 sm:gap-4">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-destructive text-xs sm:text-sm">Something went wrong</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{globalError}</p>
            </div>
          </div>
        )}

        {/* Subject list */}
        {items.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-3">
              <div>
                <h2 className="text-xs sm:text-sm font-semibold text-foreground">Your subjects</h2>
                <p className="text-[11px] sm:text-xs text-muted-foreground">
                  Select the correct subject result (if needed), then choose your group(s).
                </p>
              </div>
              <div className="flex items-center gap-2">
                {suggestMsg ? (
                  <span className="text-[11px] sm:text-xs text-muted-foreground hidden sm:inline">{suggestMsg}</span>
                ) : null}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSuggestCombo}
                  disabled={suggesting}
                  className="gap-2 text-xs h-8 px-3"
                >
                  {suggesting ? (
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  )}
                  <span className="hidden sm:inline">Find combo</span>
                  <span className="sm:hidden">Combo</span>
                </Button>
              </div>
            </div>

            <div className="max-h-[520px] overflow-y-auto pr-1 sm:pr-2 -mr-1 sm:-mr-2 grid gap-3 lg:grid-cols-2">
              {items.map((it) => {
                const groups = groupKeys(it.grouped);
                const hasGroups = groups.length > 0;
                const hasSelection = Boolean(it.selectedGroup);
                const ready = it.status === "ready";

                return (
                  <div key={it.id} className="rounded-lg sm:rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs sm:text-sm">{it.course}</span>
                          {it.subjectName && it.subjectName !== it.course ? (
                            <span className="text-xs sm:text-sm text-muted-foreground break-all">{it.subjectName}</span>
                          ) : null}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          Campus: <span className="font-mono">{it.request.campus}</span>
                          {" · "}
                          Faculty: <span className="font-mono">{it.request.faculty || "—"}</span>
                        </p>
                      </div>

                      <div className="flex items-start gap-2 sm:gap-3 self-start">
                        <div className="rounded-lg border border-border bg-muted/30 px-2 sm:px-2.5 py-1.5 sm:py-2">
                          <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            Color
                          </p>
                          <div className="mt-1 sm:mt-1.5 flex items-center gap-1 sm:gap-1.5 flex-wrap">
                            {PRESET_SUBJECT_HEX.map((hex, idx) => {
                              const selected =
                                (subjectColorOverrides[it.course] ?? "").toLowerCase() === hex.toLowerCase();
                              return (
                                <button
                                  key={`${it.course}-color-${idx}`}
                                  type="button"
                                  onClick={() => setSubjectColor(it.course, hex)}
                                  aria-label={`Set ${it.course} color ${idx + 1}`}
                                  style={{ backgroundColor: hex, borderColor: hex }}
                                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border transition-transform hover:scale-110 ${
                                    selected ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""
                                  }`}
                                />
                              );
                            })}
                            <label className="relative inline-flex h-4 w-4 sm:h-5 sm:w-5 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-border bg-background">
                              <span
                                className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-sm border border-border/60"
                                style={{ backgroundColor: subjectColorOverrides[it.course] ?? "#14b8a6" }}
                              />
                              <input
                                type="color"
                                value={subjectColorOverrides[it.course] ?? "#14b8a6"}
                                onChange={(e) => setSubjectColor(it.course, e.target.value)}
                                className="absolute inset-0 cursor-pointer opacity-0"
                                aria-label={`Pick custom color for ${it.course}`}
                              />
                            </label>
                          </div>
                          <input
                            type="text"
                            inputMode="text"
                            value={subjectColorDrafts[it.course] ?? subjectColorOverrides[it.course] ?? ""}
                            placeholder="#22c55e"
                            onChange={(e) =>
                              setSubjectColorDrafts((prev) => ({ ...prev, [it.course]: e.target.value }))
                            }
                            onBlur={(e) => {
                              const normalized = normalizeHexColor(e.target.value);
                              if (normalized) {
                                setSubjectColor(it.course, normalized);
                                return;
                              }
                              setSubjectColorDrafts((prev) => ({
                                ...prev,
                                [it.course]: subjectColorOverrides[it.course] ?? "",
                              }));
                            }}
                            className="mt-2 h-7 w-28 rounded-md border border-input bg-background px-2 text-[11px] font-mono"
                            aria-label={`Hex color for ${it.course}`}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(it.id)}
                          className="gap-2 self-start"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {it.status === "loading_subjects" && (
                      <div className="mt-4">
                        <TimetableGridSkeleton />
                      </div>
                    )}

                    {it.status === "error" && (
                      <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 flex items-start gap-3">
                        <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-destructive">Failed</p>
                          <p className="text-xs text-muted-foreground">{it.error ?? "Unknown error"}</p>
                        </div>
                      </div>
                    )}

                    {it.status === "choose_subject" && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-foreground">Pick the correct subject result</p>
                        <select
                          value={it.selectedPath ?? ""}
                          onChange={(e) => handleChooseMatch(it.id, e.target.value)}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                        >
                          <option value="" disabled>
                            Select a result…
                          </option>
                          {it.matches.map((m) => (
                            <option key={m.path} value={m.path}>
                              {m.subject || it.course}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {it.status === "loading_timetable" && (
                      <div className="mt-4">
                        <TimetableGridSkeleton />
                      </div>
                    )}

                    {ready && (
                      <div className="mt-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">
                            Groups {hasGroups ? <span className="text-muted-foreground">({groups.length})</span> : null}
                          </p>
                          {hasGroups && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleShowSelectedOnly(it.id)}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {it.showSelectedOnly ? "Show all" : "Selected only"}
                              </button>
                              {hasSelection && (
                                <button
                                  onClick={() => clearGroups(it.id)}
                                  className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {!hasGroups ? (
                          <p className="text-sm text-muted-foreground">No groups found for this subject.</p>
                        ) : (
                          <div className="space-y-3">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                value={it.groupFilter}
                                onChange={(e) => setGroupFilter(it.id, e.target.value)}
                                placeholder="Filter groups… (e.g. A, CDCS2306, 2406B)"
                                className="pl-9 pr-9"
                              />
                              {it.groupFilter.trim() ? (
                                <button
                                  onClick={() => setGroupFilter(it.id, "")}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                  aria-label="Clear group filter"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              ) : null}
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {groups
                              .filter((g) => {
                                const q = it.groupFilter.trim().toLowerCase();
                                if (it.showSelectedOnly && it.selectedGroup !== g) return false;
                                if (!q) return true;
                                return g.toLowerCase().includes(q) || `${it.course} ${g}`.toLowerCase().includes(q);
                              })
                              .map((g) => {
                              const checked = it.selectedGroup === g;
                              return (
                                <label
                                  key={g}
                                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 hover:bg-muted/30 cursor-pointer transition-colors"
                                >
                                  <input
                                    type="radio"
                                    name={`group-${it.id}`}
                                    checked={checked}
                                    onChange={() => selectGroup(it.id, g)}
                                    className="h-3.5 w-3.5 rounded accent-primary cursor-pointer"
                                  />
                                  <span className="font-mono text-xs text-foreground flex-1">
                                    {it.course} <span className="font-semibold">{g}</span>
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Combined timetable */}
        {items.length === 0 && (
          <div className="rounded-xl border border-border bg-card px-5 py-12 flex flex-col items-center gap-3 text-center">
            <CalendarX2 className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">No subjects added yet</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Add your first course code above to start building your timetable.
            </p>
          </div>
        )}

        {items.length > 0 && combinedEntries.length === 0 && (
          <div className="rounded-xl border border-border bg-card px-5 py-12 flex flex-col items-center gap-3 text-center">
            <CalendarX2 className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">Select groups to generate your timetable</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Pick at least one group for each subject you want included.
            </p>
          </div>
        )}

        {combinedEntries.length > 0 && (
          <div className="mx-auto w-full max-w-7xl space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight">My Timetable</h2>
                <p className="text-sm text-muted-foreground">
                  {displayedEntries.length} session{displayedEntries.length !== 1 ? "s" : ""} shown
                  {clashCount > 0 ? (
                    <span className="ml-2 text-destructive font-medium">
                      {clashCount} clash{clashCount !== 1 ? "es" : ""}
                    </span>
                  ) : null}
                </p>
                {exportError ? <p className="text-xs text-destructive mt-1">{exportError}</p> : null}
              </div>

              <div className="flex items-center gap-2 flex-wrap lg:justify-end">
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="gap-1.5 h-8 px-3"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Week
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="gap-1.5 h-8 px-3"
                  >
                    <List className="h-3.5 w-3.5" />
                    List
                  </Button>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => exportTimetable()}
                  disabled={exporting}
                  className="gap-2"
                >
                  {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Export JPG
                </Button>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="space-y-2">
                {clashCount > 0 && (
                  <div className="flex items-center justify-start lg:justify-end">
                    <button
                      onClick={() => setShowClashesOnly((v) => !v)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showClashesOnly ? "Show all sessions" : "Show only clashes"}
                    </button>
                  </div>
                )}
                <div ref={timetableRef} className="w-full">
                  <TimetableGrid
                    entries={displayedEntries}
                    course="MY"
                    colorOverrides={subjectColorOverrides}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {clashCount > 0 && (
                  <div className="flex items-center justify-start lg:justify-end">
                    <button
                      onClick={() => setShowClashesOnly((v) => !v)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showClashesOnly ? "Show all sessions" : "Show only clashes"}
                    </button>
                  </div>
                )}
                <div ref={timetableRef} className="w-full">
                  <TimetableTable
                    entries={displayedEntries}
                    course="MY"
                    colorOverrides={subjectColorOverrides}
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <WallpaperMaker entries={displayedEntries} colorOverrides={subjectColorOverrides} />
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
