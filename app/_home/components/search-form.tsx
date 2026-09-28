"use client";

import { useState } from "react";
import { Building2, Loader2, MapPin, Plus, Search, SearchX } from "lucide-react";
import { fetchSubjects, fetchTimetableByPath } from "@/app/_home/api";
import { FieldBox, fieldInput, GroupChips } from "@/app/_home/components/controls";
import type { SearchedSubject } from "@/app/_home/use-home-page";
import { displayName, groupKeys, splitSubjectLabel } from "@/app/_home/utils";
import { Combobox } from "@/components/ui/combobox";
import {
  FACULTY_REQUIRED_CAMPUS_CODES,
  FALLBACK_CAMPUSES,
  FALLBACK_FACULTIES,
  SHAH_ALAM_SPECIAL_CAMPUS_CODES,
} from "@/lib/constants";
import type { ComboboxOption } from "@/components/ui/combobox";
import type { GroupedTimetable, SearchRequest, SearchResult, TimetableEntry } from "@/lib/types";

const CAMPUS_OPTIONS: ComboboxOption[] = FALLBACK_CAMPUSES.map((campus) => ({
  ...campus,
  group: SHAH_ALAM_SPECIAL_CAMPUS_CODES.has(campus.code)
    ? "Shah Alam - Course Types"
    : "Campuses",
}));

const comboboxInField = "h-auto border-0 bg-transparent p-0 text-[15px] shadow-none focus:ring-0 dark:bg-transparent";

type SearchFormProps = {
  /** Paths of subjects already in the build. */
  addedPaths: Set<string>;
  /** Entries already in the build, for clash hints. */
  entries: TimetableEntry[];
  onAdd: (subject: SearchedSubject) => void;
};

type Picking = { path: string; grouped?: GroupedTimetable; group: string | null; error?: string };

export function SearchForm({ addedPaths, entries, onAdd }: SearchFormProps) {
  const [campus, setCampus] = useState("");
  const [faculty, setFaculty] = useState("");
  const [course, setCourse] = useState("");
  const [searched, setSearched] = useState<{ request: SearchRequest; results: SearchResult[] } | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [picking, setPicking] = useState<Picking | null>(null);

  const facultyRequired = FACULTY_REQUIRED_CAMPUS_CODES.has(campus);
  const canSubmit = campus && (!facultyRequired || faculty) && course.trim();

  function handleCampusChange(value: string) {
    setCampus(value);
    if (!FACULTY_REQUIRED_CAMPUS_CODES.has(value)) setFaculty("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit || searching) return;
    const request = { campus, faculty, course: course.trim().toUpperCase() };
    setSearching(true);
    setError("");
    setPicking(null);
    try {
      const { results } = await fetchSubjects(request);
      setSearched({ request, results: results ?? [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSearching(false);
    }
  }

  async function startPicking(path: string) {
    setPicking({ path, group: null });
    try {
      const { grouped } = await fetchTimetableByPath({ path, course: searched?.request.course });
      setPicking((prev) => (prev?.path === path ? { ...prev, grouped, group: groupKeys(grouped)[0] ?? null } : prev));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setPicking((prev) => (prev?.path === path ? { ...prev, error: message } : prev));
    }
  }

  function clearFilters() {
    setCourse("");
    setSearched(null);
    setError("");
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="grid gap-2 sm:grid-cols-[200px_minmax(0,1fr)_200px_auto]">
        <FieldBox label="Campus" htmlFor="campus" icon={<MapPin aria-hidden="true" />}>
          <Combobox id="campus" options={CAMPUS_OPTIONS} value={campus} onChange={handleCampusChange} placeholder="Select campus" className={comboboxInField} />
        </FieldBox>
        <FieldBox label="Faculty" htmlFor="faculty" icon={<Building2 aria-hidden="true" />}>
          <Combobox
            id="faculty"
            options={FALLBACK_FACULTIES}
            value={faculty}
            onChange={setFaculty}
            placeholder={facultyRequired ? "Select faculty" : "Not needed for this campus"}
            disabled={!facultyRequired}
            className={comboboxInField}
          />
        </FieldBox>
        <FieldBox label="Course code" htmlFor="course" icon={<Search aria-hidden="true" />}>
          <input
            id="course"
            value={course}
            onChange={(event) => setCourse(event.target.value.toUpperCase())}
            placeholder="e.g. CSC584"
            maxLength={10}
            autoComplete="off"
            className={`${fieldInput} uppercase placeholder:normal-case`}
          />
        </FieldBox>
        <button
          type="submit"
          disabled={!canSubmit || searching}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {searching ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
          Search
        </button>
      </form>

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}

      {searched && searched.results.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-border px-6 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-muted">
            <SearchX aria-hidden="true" className="size-5 text-muted-foreground" />
          </span>
          <p className="mt-4 font-semibold">No subjects match &ldquo;{searched.request.course}&rdquo;</p>
          <p className="mt-2 max-w-[420px] text-sm leading-[1.5] text-muted-foreground">
            Check the code or try another faculty. Some subjects are listed under the offering faculty.
          </p>
          <button type="button" onClick={clearFilters} className="mt-4 h-9 rounded-lg bg-muted px-4 text-sm font-medium hover:bg-surface-3">
            Clear filters
          </button>
        </div>
      ) : null}

      {searched && searched.results.length > 0 ? (
        <div>
          <p className="text-[13px] text-muted-foreground">
            {searched.results.length} subject{searched.results.length === 1 ? "" : "s"} match
          </p>
          <ul className="mt-3 space-y-2">
            {searched.results.map((result) => {
              const { code, name } = splitSubjectLabel(result.subject, searched.request.course);
              const added = addedPaths.has(result.path);
              const open = picking?.path === result.path;
              const others = entries.filter((entry) => entry.course !== code);
              return (
                <li key={result.path} className={open ? "rounded-xl border-2 border-primary bg-muted p-3" : "rounded-xl bg-muted"}>
                  <div className={open ? "flex items-center gap-3" : "flex min-h-[52px] items-center gap-3 px-3.5 py-2"}>
                    <p className="min-w-0 flex-1 truncate text-sm">
                      <span className="font-semibold">{code}</span>{" "}
                      <span className="text-muted-foreground">{displayName(name)}</span>
                    </p>
                    {open ? (
                      <span className="text-xs text-primary-soft-foreground">Choose a group</span>
                    ) : added ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                        Added
                      </span>
                    ) : (
                      <button type="button" onClick={() => void startPicking(result.path)} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-surface-3 px-3 text-sm hover:opacity-90">
                        <Plus aria-hidden="true" className="size-4" />
                        Add
                      </button>
                    )}
                  </div>
                  {open ? (
                    <div className="mt-3 space-y-3">
                      {picking.error ? (
                        <p role="alert" className="text-sm text-destructive">{picking.error}</p>
                      ) : !picking.grouped ? (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                          Loading groups…
                        </p>
                      ) : (
                        <GroupChips
                          grouped={picking.grouped}
                          groups={groupKeys(picking.grouped)}
                          selected={picking.group}
                          others={others}
                          onSelect={(group) => setPicking({ ...picking, group })}
                        />
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={!picking.grouped || !picking.group}
                          onClick={() => {
                            if (!picking.grouped || !picking.group) return;
                            onAdd({
                              request: searched.request,
                              course: code,
                              subjectName: displayName(name),
                              path: result.path,
                              grouped: picking.grouped,
                              selectedGroup: picking.group,
                            });
                            setPicking(null);
                          }}
                          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                        >
                          <Plus aria-hidden="true" className="size-4" />
                          Add {picking.group ?? ""}
                        </button>
                        <button type="button" onClick={() => setPicking(null)} className="h-9 rounded-lg px-4 text-sm hover:bg-surface-3">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
