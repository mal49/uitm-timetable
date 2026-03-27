"use client";

import { toBlob } from "html-to-image";
import { useRef, useState } from "react";
import {
  LayoutGrid,
  List,
  AlertCircle,
  CalendarX2,
  Smartphone,
  Trash2,
  Wand2,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/search-form";
import {
  TimetableGrid,
  TimetableGridSkeleton,
} from "@/components/timetable-grid";
import { TimetableTable } from "@/components/timetable-table";
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
type ItemStatus =
  | "loading_subjects"
  | "choose_subject"
  | "loading_timetable"
  | "ready"
  | "error";

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
    const sorted = [...dayEntries].sort(
      (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
    );

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
  const [subjectColorOverrides, setSubjectColorOverrides] = useState<
    Record<string, string>
  >({});
  const [subjectColorDrafts, setSubjectColorDrafts] = useState<
    Record<string, string>
  >({});

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

  async function fetchTimetableByPath(payload: {
    path: string;
    course: string;
    subject: string;
  }) {
    const res = await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as TimetableByPathResponse & {
      error?: string;
    };
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
            it.id === id
              ? {
                  ...it,
                  status: "error",
                  error: "No matching subject results found.",
                }
              : it,
          ),
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
              : it,
          ),
        );

        const ttb = await fetchTimetableByPath({
          path: only.path,
          course,
          subject: only.subject || course,
        });

        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? { ...it, grouped: ttb.grouped, status: "ready" }
              : it,
          ),
        );
        return;
      }

      setItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, matches, status: "choose_subject" } : it,
        ),
      );
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
      }),
    );

    const item = items.find((it) => it.id === itemId);
    const match = item?.matches.find((m) => m.path === path);
    const course = item?.course ?? "";
    const subject = match?.subject || course;

    try {
      const ttb = await fetchTimetableByPath({ path, course, subject });
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? { ...it, grouped: ttb.grouped, status: "ready" }
            : it,
        ),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId ? { ...it, status: "error", error: msg } : it,
        ),
      );
    }
  }

  function selectGroup(itemId: string, group: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        return { ...it, selectedGroup: group };
      }),
    );
  }

  function setGroupFilter(itemId: string, value: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, groupFilter: value } : it)),
    );
  }

  function toggleShowSelectedOnly(itemId: string) {
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? { ...it, showSelectedOnly: !it.showSelectedOnly }
          : it,
      ),
    );
  }

  function clearGroups(itemId: string) {
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId ? { ...it, selectedGroup: null } : it,
      ),
    );
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
      const bodyBg =
        typeof window !== "undefined"
          ? window.getComputedStyle(document.body).backgroundColor
          : "";
      const backgroundColor =
        bodyBg && bodyBg !== "rgba(0, 0, 0, 0)" ? bodyBg : "#ffffff";

      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      const baseName = `uitm-class-canvas-${stamp}-${viewMode}`;

      const common = {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor,
        // Avoid html-to-image font embedding crashes when a font is missing/undefined.
        skipFonts: true,
      };

      // Wait one frame so off-screen export tree has laid out (especially on mobile).
      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      const blob = await toBlob(node, {
        ...common,
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

      const ordered = [...ready].sort(
        (a, b) => a.groups.length - b.groups.length,
      );
      const startedAt = performance.now();
      const BUDGET_MS = 450;

      let bestScore = Number.POSITIVE_INFINITY;
      let bestSelection: Record<string, string> | null = null;

      function buildEntriesFor(
        subject: (typeof ordered)[number],
        group: string,
      ): TimetableEntry[] {
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
        selection: Record<string, string>,
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
          const nextEntries = currentEntries.concat(
            buildEntriesFor(subject, group),
          );
          const partial = score(nextEntries);
          if (partial >= bestScore) continue;
          recurse(idx + 1, nextEntries, { ...selection, [subject.id]: group });
          if (bestScore === 0) return;
        }
      }

      recurse(0, [], {});

      if (!bestSelection) {
        setSuggestMsg(
          "Couldn’t find a suggestion. Try selecting some groups manually first.",
        );
        return;
      }

      setItems((prev) =>
        prev.map((it) => {
          const chosen = bestSelection?.[it.id];
          if (!chosen) return it;
          return { ...it, selectedGroup: chosen };
        }),
      );

      setSuggestMsg(
        bestScore === 0
          ? "Found a clash-free combination."
          : `Suggested a combination with ${bestScore} clash${bestScore !== 1 ? "es" : ""}.`,
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

  const displayedEntries = showClashesOnly
    ? combinedEntries.filter((e) => e.isClash)
    : combinedEntries;
  const clashCount = combinedEntries.filter((e) => e.isClash).length;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f7f3ea] text-slate-900">
      {/* Off-screen export tree (desktop width). */}
      {combinedEntries.length > 0 ? (
        <div
          aria-hidden="true"
          className="fixed left-[-10000px] top-0 pointer-events-none opacity-0">
          <div
            ref={exportRef}
            // 1200px matches the app's comfortable desktop width and yields a horizontal JPG.
            style={{ width: 1200 }}
            className="bg-background p-4">
            {viewMode === "grid" ? (
              <TimetableGrid
                entries={displayedEntries}
                course="MY"
                layoutDesktop
                colorOverrides={subjectColorOverrides}
              />
            ) : (
              <div className="w-full">
                <TimetableTable
                  entries={displayedEntries}
                  course="MY"
                  colorOverrides={subjectColorOverrides}
                />
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="absolute inset-x-0 top-0 h-[760px] bg-[radial-gradient(circle_at_top_left,_rgba(168,245,229,0.18),_transparent_20%),radial-gradient(circle_at_top_right,_rgba(111,211,255,0.18),_transparent_24%),linear-gradient(180deg,_#061b1d_0%,_#10263a_38%,_#39255a_72%,_#5e3f86_100%)]" />
      <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-[1.75rem] border border-white/55 bg-white/92 px-5 py-3 text-slate-900 shadow-[0_18px_40px_rgba(45,88,135,0.12)] backdrop-blur-xl sm:px-7 sm:py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 ring-1 ring-cyan-200">
              <Smartphone className="h-4 w-4 text-cyan-700" />
            </div>
            <span className="text-sm font-semibold tracking-tight sm:text-base">
              UiTM Schedule
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Malaysia
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="relative z-20 pb-16 pt-10 text-white sm:pb-20 sm:pt-12">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/78 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-[#7df4c3]" />
                Schedule wallpaper maker
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
                Turn Your Schedule
                <span className="block text-[#7df4c3]">into a wallpaper</span>
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/72 sm:text-base">
                Search subjects, choose the right groups, and generate a custom
                wallpaper from your final class schedule.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <div className="rounded-full bg-[#21d4cf] px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_10px_24px_rgba(33,212,207,0.24)]">
                  Start with your schedule
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-4xl">
              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-[0_26px_60px_rgba(5,10,25,0.18)] backdrop-blur-md sm:p-6">
                <div className="flex flex-col gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      Build your schedule
                    </p>
                    <p className="text-xs leading-5 text-white/65 sm:text-sm">
                      Pick your campus, faculty, and course code to pull in the
                      schedule you want to turn into a wallpaper.
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-[#6b5a8f]/78 p-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-5">
                  <SearchForm onSubmit={handleAddSubject} isLoading={adding} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-8 sm:gap-8 sm:px-6 sm:pb-12">
            {globalError && (
              <div className="flex items-start gap-3 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-4 text-slate-900 shadow-sm sm:px-5">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-rose-700">
                    Something went wrong
                  </p>
                  <p className="text-sm text-slate-600">{globalError}</p>
                </div>
              </div>
            )}

            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[2rem] bg-white p-5 shadow-[0_24px_60px_rgba(31,41,55,0.08)] ring-1 ring-slate-200/70 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Subjects
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                      Build your schedule
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Pick the right subject result, lock in your groups, and
                      set colors before sending everything into the wallpaper
                      maker.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {suggestMsg ? (
                      <span className="hidden text-xs text-slate-500 sm:inline">
                        {suggestMsg}
                      </span>
                    ) : null}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSuggestCombo}
                      disabled={suggesting}
                      className="h-9 gap-2 rounded-full border-0 bg-[#21d4cf] px-4 text-xs font-semibold text-slate-950 shadow-[0_12px_24px_rgba(33,212,207,0.2)] hover:bg-[#3fe1dc]">
                      {suggesting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">Find combo</span>
                      <span className="sm:hidden">Combo</span>
                    </Button>
                  </div>
                </div>

                {items.length > 0 ? (
                  <div className="-mr-1 mt-5 grid max-h-[560px] gap-3 overflow-y-auto pr-1 sm:-mr-2 sm:pr-2 xl:grid-cols-2">
                    {items.map((it) => {
                      const groups = groupKeys(it.grouped);
                      const hasGroups = groups.length > 0;
                      const hasSelection = Boolean(it.selectedGroup);
                      const ready = it.status === "ready";

                      return (
                        <div
                          key={it.id}
                          className="min-w-0 rounded-[1.5rem] border border-slate-200 bg-[#fffdf9] p-4 shadow-sm">
                          <div className="min-w-0 space-y-3">
                            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                  <span className="inline-flex max-w-full shrink-0 rounded-full bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold leading-none text-white">
                                    {it.course}
                                  </span>
                                  {it.subjectName &&
                                  it.subjectName !== it.course ? (
                                    <span className="min-w-0 break-words text-xs text-slate-500 sm:text-sm">
                                      {it.subjectName}
                                    </span>
                                  ) : null}
                                </div>
                                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 sm:text-xs">
                                  <p className="min-w-0">
                                    Campus:{" "}
                                    <span className="font-mono text-slate-700">
                                      {it.request.campus}
                                    </span>
                                  </p>
                                  <span className="text-slate-300">•</span>
                                  <p className="min-w-0">
                                    Faculty:{" "}
                                    <span className="font-mono text-slate-700">
                                      {it.request.faculty || "—"}
                                    </span>
                                  </p>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(it.id)}
                                className="justify-start gap-2 self-start rounded-full px-0 text-slate-500 hover:bg-transparent hover:text-slate-900 sm:px-3 sm:hover:bg-slate-100">
                                <Trash2 className="h-4 w-4 shrink-0" />
                                <span>Remove</span>
                              </Button>
                            </div>

                            <div className="w-full min-w-0 rounded-2xl bg-slate-100 px-3 py-2 sm:max-w-[260px]">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Color
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                {PRESET_SUBJECT_HEX.map((hex, idx) => {
                                  const selected =
                                    (
                                      subjectColorOverrides[it.course] ?? ""
                                    ).toLowerCase() === hex.toLowerCase();
                                  return (
                                    <button
                                      key={`${it.course}-color-${idx}`}
                                      type="button"
                                      onClick={() =>
                                        setSubjectColor(it.course, hex)
                                      }
                                      aria-label={`Set ${it.course} color ${idx + 1}`}
                                      style={{
                                        backgroundColor: hex,
                                        borderColor: hex,
                                      }}
                                      className={`h-4 w-4 rounded-full border transition-transform hover:scale-110 ${
                                        selected
                                          ? "ring-2 ring-slate-900 ring-offset-2 ring-offset-[#fffdf9]"
                                          : ""
                                      }`}
                                    />
                                  );
                                })}
                                <label className="relative inline-flex h-5 w-5 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-slate-300 bg-white">
                                  <span
                                    className="h-3.5 w-3.5 rounded-sm border border-slate-300"
                                    style={{
                                      backgroundColor:
                                        subjectColorOverrides[it.course] ??
                                        "#14b8a6",
                                    }}
                                  />
                                  <input
                                    type="color"
                                    value={
                                      subjectColorOverrides[it.course] ??
                                      "#14b8a6"
                                    }
                                    onChange={(e) =>
                                      setSubjectColor(it.course, e.target.value)
                                    }
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                    aria-label={`Pick custom color for ${it.course}`}
                                  />
                                </label>
                              </div>
                              <input
                                type="text"
                                inputMode="text"
                                value={
                                  subjectColorDrafts[it.course] ??
                                  subjectColorOverrides[it.course] ??
                                  ""
                                }
                                placeholder="#22c55e"
                                onChange={(e) =>
                                  setSubjectColorDrafts((prev) => ({
                                    ...prev,
                                    [it.course]: e.target.value,
                                  }))
                                }
                                onBlur={(e) => {
                                  const normalized = normalizeHexColor(
                                    e.target.value,
                                  );
                                  if (normalized) {
                                    setSubjectColor(it.course, normalized);
                                    return;
                                  }
                                  setSubjectColorDrafts((prev) => ({
                                    ...prev,
                                    [it.course]:
                                      subjectColorOverrides[it.course] ?? "",
                                  }));
                                }}
                                className="mt-2 h-8 w-28 rounded-lg border border-slate-300 bg-white px-2 text-[11px] font-mono text-slate-700"
                                aria-label={`Hex color for ${it.course}`}
                              />
                            </div>
                          </div>

                          {it.status === "loading_subjects" && (
                            <div className="mt-4">
                              <TimetableGridSkeleton />
                            </div>
                          )}

                          {it.status === "error" && (
                            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                              <div className="space-y-0.5">
                                <p className="text-sm font-semibold text-rose-700">
                                  Failed
                                </p>
                                <p className="text-xs text-slate-600">
                                  {it.error ?? "Unknown error"}
                                </p>
                              </div>
                            </div>
                          )}

                          {it.status === "choose_subject" && (
                            <div className="mt-4 space-y-2">
                              <p className="text-sm font-medium text-slate-900">
                                Pick the correct subject result
                              </p>
                              <select
                                value={it.selectedPath ?? ""}
                                onChange={(e) =>
                                  handleChooseMatch(it.id, e.target.value)
                                }
                                className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900">
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
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm font-medium text-slate-900">
                                  Groups{" "}
                                  {hasGroups ? (
                                    <span className="text-slate-500">
                                      ({groups.length})
                                    </span>
                                  ) : null}
                                </p>
                                {hasGroups && (
                                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                                    <button
                                      onClick={() =>
                                        toggleShowSelectedOnly(it.id)
                                      }
                                      className="text-xs text-slate-500 transition-colors hover:text-slate-900">
                                      {it.showSelectedOnly
                                        ? "Show all"
                                        : "Selected only"}
                                    </button>
                                    {hasSelection && (
                                      <button
                                        onClick={() => clearGroups(it.id)}
                                        className="text-xs font-medium text-teal-700 transition-colors hover:text-teal-600">
                                        Clear
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              {!hasGroups ? (
                                <p className="text-sm text-slate-500">
                                  No groups found for this subject.
                                </p>
                              ) : (
                                <div className="space-y-3">
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                      value={it.groupFilter}
                                      onChange={(e) =>
                                        setGroupFilter(it.id, e.target.value)
                                      }
                                      placeholder="Filter groups… (e.g. A, CDCS2306, 2406B)"
                                      className="border-slate-300 bg-white pl-9 pr-9 text-slate-900"
                                    />
                                    {it.groupFilter.trim() ? (
                                      <button
                                        onClick={() =>
                                          setGroupFilter(it.id, "")
                                        }
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-900"
                                        aria-label="Clear group filter">
                                        <X className="h-4 w-4" />
                                      </button>
                                    ) : null}
                                  </div>

                                  <div className="grid gap-2 sm:grid-cols-2">
                                    {groups
                                      .filter((g) => {
                                        const q = it.groupFilter
                                          .trim()
                                          .toLowerCase();
                                        if (
                                          it.showSelectedOnly &&
                                          it.selectedGroup !== g
                                        )
                                          return false;
                                        if (!q) return true;
                                        return (
                                          g.toLowerCase().includes(q) ||
                                          `${it.course} ${g}`
                                            .toLowerCase()
                                            .includes(q)
                                        );
                                      })
                                      .map((g) => {
                                        const checked = it.selectedGroup === g;
                                        return (
                                          <label
                                            key={g}
                                            className="flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 transition-colors hover:bg-slate-50">
                                            <input
                                              type="radio"
                                              name={`group-${it.id}`}
                                              checked={checked}
                                              onChange={() =>
                                                selectGroup(it.id, g)
                                              }
                                              className="h-3.5 w-3.5 cursor-pointer rounded accent-teal-500"
                                            />
                                            <span className="min-w-0 flex-1 break-words font-mono text-xs text-slate-800">
                                              {it.course}{" "}
                                              <span className="font-semibold">
                                                {g}
                                              </span>
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
                ) : (
                  <div className="mt-5 flex min-h-[280px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-[#faf7f0] px-5 py-10 text-center">
                    <CalendarX2 className="h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-base font-semibold text-slate-900">
                      No subjects added yet
                    </p>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      Add your first course code above to start building your
                      schedule wallpaper.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-5">
                <div className="rounded-[2rem] bg-[#2a1848] p-5 text-white shadow-[0_24px_50px_rgba(42,24,72,0.24)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
                    How it works
                  </p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-lg font-bold">
                        1. Search the right subject
                      </p>
                      <p className="mt-1 text-sm leading-6 text-white/70">
                        Pull subject matches from campus and faculty, then
                        choose the exact result if more than one shows up.
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        2. Pick the best group combo
                      </p>
                      <p className="mt-1 text-sm leading-6 text-white/70">
                        Compare groups manually or let the combo helper look for
                        a cleaner, clash-free schedule.
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        3. Turn it into a wallpaper
                      </p>
                      <p className="mt-1 text-sm leading-6 text-white/70">
                        Once your classes look right, open the wallpaper maker
                        and export a polished version for your phone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.07)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Snapshot
                  </p>
                  <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
                    {items.length}
                  </p>
                  <p className="text-sm text-slate-500">
                    subject{items.length !== 1 ? "s" : ""} in your current build
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-100 p-3">
                      <p className="text-xl font-bold text-slate-900">
                        {combinedEntries.length}
                      </p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Sessions
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-3">
                      <p className="text-xl font-bold text-slate-900">
                        {clashCount}
                      </p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Clashes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {items.length > 0 && (
          <section className="relative overflow-hidden bg-[linear-gradient(180deg,_#2e1d52_0%,_#17182d_100%)] py-12 text-white sm:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(125,244,195,0.12),_transparent_30%)]" />
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              {combinedEntries.length === 0 ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-white/8 px-5 py-12 text-center backdrop-blur-sm">
                  <CalendarX2 className="h-10 w-10 text-white/35" />
                  <p className="mt-3 text-lg font-semibold text-white">
                    Select groups to generate your class canvas
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-white/70">
                    Pick at least one group for each subject you want included
                    in the wallpaper.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
                        Wallpaper Source
                      </p>
                      <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
                        Your class canvas
                      </h2>
                      <p className="mt-1 text-sm text-white/72">
                        {displayedEntries.length} session
                        {displayedEntries.length !== 1 ? "s" : ""} ready for
                        timetable view and wallpaper export
                        {clashCount > 0 ? (
                          <span className="ml-2 font-medium text-[#ff8e8e]">
                            {clashCount} clash{clashCount !== 1 ? "es" : ""}
                          </span>
                        ) : null}
                      </p>
                      {exportError ? (
                        <p className="mt-1 text-xs text-[#ffb4b4]">
                          {exportError}
                        </p>
                      ) : null}
                    </div>

                    <div className="hidden w-full flex-col items-stretch gap-2 sm:flex sm:w-auto sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
                      <div className="relative z-10 grid w-full grid-cols-2 gap-1 rounded-full bg-white/10 p-1 pointer-events-auto sm:flex sm:w-auto sm:items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewMode("grid")}
                          className={`relative z-10 h-8 w-full gap-1.5 rounded-full border-0 pointer-events-auto sm:w-auto ${
                            viewMode === "grid"
                              ? "bg-white text-slate-900 hover:bg-white/90"
                              : "bg-transparent text-white hover:bg-white/10"
                          }`}>
                          <LayoutGrid className="h-3.5 w-3.5" />
                          Week
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewMode("table")}
                          className={`relative z-10 h-8 w-full gap-1.5 rounded-full border-0 pointer-events-auto sm:w-auto ${
                            viewMode === "table"
                              ? "bg-white text-slate-900 hover:bg-white/90"
                              : "bg-transparent text-white hover:bg-white/10"
                          }`}>
                          <List className="h-3.5 w-3.5" />
                          List
                        </Button>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => exportTimetable()}
                        disabled={exporting}
                        className="h-9 w-full gap-2 rounded-full border-0 bg-[#21d4cf] px-4 font-semibold text-slate-950 shadow-[0_12px_24px_rgba(33,212,207,0.2)] hover:bg-[#3fe1dc] sm:w-auto">
                        {exporting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        Export JPG
                      </Button>
                    </div>
                  </div>

                  {viewMode === "grid" ? (
                    <div className="hidden space-y-2 sm:block">
                      {clashCount > 0 && (
                        <div className="flex items-center justify-start lg:justify-end">
                          <button
                            onClick={() => setShowClashesOnly((v) => !v)}
                            className="text-xs text-white/65 transition-colors hover:text-white">
                            {showClashesOnly
                              ? "Show all sessions"
                              : "Show only clashes"}
                          </button>
                        </div>
                      )}
                      <div
                        ref={timetableRef}
                        className="w-full rounded-[2rem] bg-white p-2 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:p-3">
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
                            className="text-xs text-white/65 transition-colors hover:text-white">
                            {showClashesOnly
                              ? "Show all sessions"
                              : "Show only clashes"}
                          </button>
                        </div>
                      )}
                      <div
                        ref={timetableRef}
                        className="w-full rounded-[2rem] bg-white p-2 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:p-3">
                        <TimetableTable
                          entries={displayedEntries}
                          course="MY"
                          colorOverrides={subjectColorOverrides}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <WallpaperMaker
                      entries={displayedEntries}
                      colorOverrides={subjectColorOverrides}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
