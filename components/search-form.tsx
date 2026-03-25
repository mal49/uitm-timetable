"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { FALLBACK_CAMPUSES, FALLBACK_FACULTIES, NO_FACULTY_CAMPUS_CODES } from "@/lib/constants";
import type { ComboboxOption } from "@/components/ui/combobox";
import type { SearchRequest } from "@/lib/types";

const CAMPUS_OPTIONS: ComboboxOption[] = FALLBACK_CAMPUSES.map((c) => ({
  ...c,
  group: NO_FACULTY_CAMPUS_CODES.has(c.code) ? "Shah Alam – Course Types" : "Campuses",
}));

interface SearchFormProps {
  onSubmit: (data: SearchRequest) => void;
  isLoading: boolean;
}

export function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
  const [campus, setCampus] = useState("");
  const [faculty, setFaculty] = useState("");
  const [course, setCourse] = useState("");

  const facultyRequired = !NO_FACULTY_CAMPUS_CODES.has(campus);

  function handleCampusChange(value: string) {
    setCampus(value);
    // Clear faculty when switching to a campus that doesn't need one
    if (NO_FACULTY_CAMPUS_CODES.has(value)) setFaculty("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const needsFaculty = !NO_FACULTY_CAMPUS_CODES.has(campus);
    if (!campus || (needsFaculty && !faculty) || !course.trim()) return;
    onSubmit({ campus, faculty, course: course.trim() });
  }

  const canSubmit = campus && (!facultyRequired || faculty) && course.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-3">
        {/* Campus */}
        <div className="space-y-2">
          <Label htmlFor="campus" className="text-sm font-medium">
            Campus
          </Label>
          <Combobox
            id="campus"
            options={CAMPUS_OPTIONS}
            value={campus}
            onChange={handleCampusChange}
            placeholder="Select campus…"
          />
        </div>

        {/* Faculty — hidden for special course-type campuses */}
        <div className="space-y-2">
          <Label htmlFor="faculty" className={`text-sm font-medium ${!facultyRequired ? "text-muted-foreground/50" : ""}`}>
            Faculty
            {!facultyRequired && (
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">(not required)</span>
            )}
          </Label>
          <Combobox
            id="faculty"
            options={FALLBACK_FACULTIES}
            value={faculty}
            onChange={setFaculty}
            placeholder={facultyRequired ? "Select faculty…" : "N/A for this campus"}
            disabled={!facultyRequired}
          />
        </div>

        {/* Course */}
        <div className="space-y-2">
          <Label htmlFor="course" className="text-sm font-medium">
            Course Code
          </Label>
          <Input
            id="course"
            value={course}
            onChange={(e) => setCourse(e.target.value.toUpperCase())}
            placeholder="e.g. CSC669"
            maxLength={10}
            className="font-mono uppercase"
            autoComplete="off"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !canSubmit}
        className="w-full sm:w-auto gap-2 font-medium"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching timetable…
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Search Timetable
          </>
        )}
      </Button>
    </form>
  );
}
