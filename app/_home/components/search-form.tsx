"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FACULTY_REQUIRED_CAMPUS_CODES,
  FALLBACK_CAMPUSES,
  FALLBACK_FACULTIES,
  SHAH_ALAM_SPECIAL_CAMPUS_CODES,
} from "@/lib/constants";
import type { ComboboxOption } from "@/components/ui/combobox";
import type { SearchRequest } from "@/lib/types";

const CAMPUS_OPTIONS: ComboboxOption[] = FALLBACK_CAMPUSES.map((campus) => ({
  ...campus,
  group: SHAH_ALAM_SPECIAL_CAMPUS_CODES.has(campus.code)
    ? "Shah Alam - Course Types"
    : "Campuses",
}));

type SearchFormProps = {
  onSubmit: (data: SearchRequest) => void;
  isLoading: boolean;
};

export function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
  const [campus, setCampus] = useState("");
  const [faculty, setFaculty] = useState("");
  const [course, setCourse] = useState("");

  const facultyRequired = FACULTY_REQUIRED_CAMPUS_CODES.has(campus);

  function handleCampusChange(value: string) {
    setCampus(value);
    if (!FACULTY_REQUIRED_CAMPUS_CODES.has(value)) setFaculty("");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!campus || (facultyRequired && !faculty) || !course.trim()) return;
    onSubmit({ campus, faculty, course: course.trim() });
  }

  const canSubmit = campus && (!facultyRequired || faculty) && course.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5">
        <div className="space-y-2">
          <Label htmlFor="campus" className="text-sm font-semibold text-white">
            Campus
          </Label>
          <Combobox
            id="campus"
            options={CAMPUS_OPTIONS}
            value={campus}
            onChange={handleCampusChange}
            placeholder="Select campus..."
            className="border-white/20 bg-white/92 text-slate-900 shadow-[0_10px_20px_rgba(15,23,42,0.08)]"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="faculty"
            className={`text-sm font-semibold ${facultyRequired ? "text-white" : "text-white/72"}`}
          >
            Faculty
            {!facultyRequired ? (
              <span className="ml-1.5 text-xs font-medium text-white/62">
                (not required)
              </span>
            ) : null}
          </Label>
          <Combobox
            id="faculty"
            options={FALLBACK_FACULTIES}
            value={faculty}
            onChange={setFaculty}
            placeholder={facultyRequired ? "Select faculty..." : "N/A for this campus"}
            disabled={!facultyRequired}
            className="border-white/20 bg-white/92 text-slate-900 shadow-[0_10px_20px_rgba(15,23,42,0.08)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="course" className="text-sm font-semibold text-white">
            Course Code
          </Label>
          <Input
            id="course"
            value={course}
            onChange={(event) => setCourse(event.target.value.toUpperCase())}
            placeholder="e.g. CSC669"
            maxLength={10}
            className="border-white/20 bg-white/92 font-mono uppercase text-slate-900 shadow-[0_10px_20px_rgba(15,23,42,0.08)] placeholder:text-slate-400"
            autoComplete="off"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !canSubmit}
        className="w-full gap-2 rounded-full border-0 bg-[#21d4cf] font-semibold text-slate-950 shadow-[0_12px_24px_rgba(33,212,207,0.24)] hover:bg-[#3fe1dc] sm:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching timetable...
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
