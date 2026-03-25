"use client";

import { useState } from "react";
import { LayoutGrid, List, AlertCircle, CalendarX2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/search-form";
import { TimetableGrid, TimetableGridSkeleton, TimetableLegend } from "@/components/timetable-grid";
import { TimetableTable } from "@/components/timetable-table";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SearchRequest, SearchResponse } from "@/lib/types";

type ViewMode = "grid" | "table";
type Status = "idle" | "loading" | "success" | "error" | "empty";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());

  function toggleSection(section: string) {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  async function handleSearch(data: SearchRequest) {
    setStatus("loading");
    setResult(null);
    setErrorMsg("");
    setSelectedSections(new Set());

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setResult(json as SearchResponse);
          setStatus("empty");
        } else {
          setErrorMsg(json.error ?? "An unexpected error occurred.");
          setStatus("error");
        }
        return;
      }

      const timetable = json as SearchResponse;
      setResult(timetable);
      setStatus("success");
    } catch {
      setErrorMsg("Could not connect to the server. Please check your network and try again.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm tracking-tight">UiTM Timetable</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">

        {/* Hero */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Find Your Timetable
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
            Search for class schedules from UiTM&apos;s student portal by entering your campus,
            faculty code, and course code.
          </p>
        </div>

        {/* Search form card */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <SearchForm onSubmit={handleSearch} isLoading={status === "loading"} />
        </div>

        {/* Results area */}
        {status === "loading" && (
          <div className="space-y-4">
            <div className="h-5 w-40 rounded bg-muted animate-pulse" />
            <TimetableGridSkeleton />
          </div>
        )}

        {status === "error" && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-5 py-6 flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-destructive text-sm">Failed to fetch timetable</p>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
            </div>
          </div>
        )}

        {status === "empty" && (
          <div className="rounded-xl border border-border bg-card px-5 py-12 flex flex-col items-center gap-3 text-center">
            <CalendarX2 className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">No timetable found</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              No sessions were returned for{" "}
              <span className="font-mono font-medium">{result?.course ?? "this course"}</span>.
              {" "}Double-check the campus, faculty code, and course code and try again.
            </p>
          </div>
        )}

        {status === "success" && result && (() => {
          const displayEntries =
            selectedSections.size === 0
              ? result.entries
              : result.entries.filter((e) => selectedSections.has(e.section));

          return (
            <div className="space-y-4">
              {/* Result header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    {result.course}
                    {result.subject && result.subject !== result.course ? (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {result.subject}
                      </span>
                    ) : null}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {displayEntries.length} of {result.entries.length} session{result.entries.length !== 1 ? "s" : ""} shown
                  </p>
                </div>

                {/* View mode toggle */}
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
              </div>

              {/* Legend / section filter */}
              <TimetableLegend
                entries={result.entries}
                course={result.course}
                selectedSections={selectedSections}
                onToggle={toggleSection}
                onClear={() => setSelectedSections(new Set())}
                onSelectAll={() =>
                  setSelectedSections(
                    new Set(result.entries.map((e) => e.section).filter(Boolean))
                  )
                }
              />

              {/* Views */}
              {viewMode === "grid" ? (
                <TimetableGrid entries={displayEntries} course={result.course} />
              ) : (
                <TimetableTable entries={displayEntries} course={result.course} />
              )}
            </div>
          );
        })()}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        UiTM Timetable Maker — data sourced from{" "}
        <span className="font-mono">simsweb4.uitm.edu.my</span>
      </footer>
    </div>
  );
}
