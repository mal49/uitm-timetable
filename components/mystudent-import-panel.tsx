"use client";

import { useState } from "react";
import { ArrowRight, IdCard, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type MyStudentImportResult,
  parseMyStudentImportData,
} from "@/lib/importers/mystudent";

type MyStudentImportPanelProps = {
  onConfirmImport: (result: MyStudentImportResult) => void;
  hasSavedImport: boolean;
  savedImportLabel?: string;
  onRestoreSavedImport: () => void;
  onClearSavedImport: () => void;
};

export function MyStudentImportPanel({
  onConfirmImport,
}: MyStudentImportPanelProps) {
  const [studentId, setStudentId] = useState("");
  const [fetchingStudentId, setFetchingStudentId] = useState(false);
  const [error, setError] = useState("");

  async function handleFetchFromStudentId() {
    const normalizedId = studentId.trim();
    if (!/^\d+$/.test(normalizedId)) {
      setError("Enter a valid numeric student ID first.");
      return;
    }

    try {
      setFetchingStudentId(true);
      setError("");

      const response = await fetch(
        `/api/mystudent?studentId=${encodeURIComponent(normalizedId)}`,
        {
          cache: "no-store",
        },
      );
      const json = (await response.json()) as Record<string, unknown> & {
        error?: string;
        detail?: string;
      };

      if (!response.ok) {
        throw new Error(
          [json.error, json.detail].filter(Boolean).join(" ") ||
            "Failed to fetch timetable for that student ID.",
        );
      }

      const result = parseMyStudentImportData(json);
      setStudentId(normalizedId);
      onConfirmImport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setFetchingStudentId(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[1.55rem] border border-white/20 bg-[linear-gradient(145deg,rgba(246,240,255,0.92),rgba(226,214,247,0.9),rgba(239,232,251,0.9))] p-4 shadow-[0_16px_36px_rgba(57,33,92,0.16)] backdrop-blur-md sm:p-4.5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,244,195,0.12),transparent_22%),radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_26%),radial-gradient(circle_at_bottom,rgba(84,49,128,0.1),transparent_38%)]" />

      <div className="relative flex flex-col gap-3.5">
        <div className="max-w-2xl space-y-2 animate-[fade-in_500ms_ease-out]">
          <div className="space-y-2">
            <h3 className="text-[1.55rem] font-bold tracking-[-0.045em] text-[#241232] sm:text-[1.85rem]">
              Import with student ID.
            </h3>
            <p className="max-w-xl text-sm leading-6 text-[#5d4f6d] sm:text-[14px]">
              Recommended. The timetable loads directly from MyStudent.
            </p>
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-white/35 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(245,240,252,0.86))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_10px_24px_rgba(50,24,84,0.08)] animate-[fade-in_700ms_ease-out] backdrop-blur-sm sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a6890]">
              Student ID
            </p>
            <span className="rounded-full border border-[#b8f0e2] bg-[#def8f0] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#149987] animate-[pulse_2.4s_ease-in-out_infinite]">
              Recommended
            </span>
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <IdCard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f83a3]" />
              <Input
                value={studentId}
                onChange={(event) => {
                  setStudentId(event.target.value.replace(/[^\d]/g, ""));
                  setError("");
                }}
                inputMode="numeric"
                placeholder="e.g. 2023456789"
                className="h-12 rounded-[1rem] border-[#ddd2ef] bg-white pl-11 text-[15px] text-[#27183a] placeholder:text-[#9788ab] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus-visible:ring-[#21d4cf]/35"
              />
            </div>

            <Button
              type="button"
              onClick={handleFetchFromStudentId}
              disabled={fetchingStudentId}
              className="h-12 rounded-[1rem] border-0 bg-[linear-gradient(135deg,#22d3c5,#16a89e)] px-4 text-sm font-semibold text-[#08211f] shadow-[0_12px_24px_rgba(33,212,207,0.18)] transition-transform duration-200 hover:scale-[1.02] hover:bg-[linear-gradient(135deg,#1dc4b7,#139187)]">
              {fetchingStudentId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Load
            </Button>
          </div>

          <p className="mt-3 text-xs leading-5 text-[#665878]">
            Use your student ID only.
          </p>

          {error ? (
            <div className="mt-4 flex items-start gap-3 rounded-[1.2rem] border border-[#efc9c0]/70 bg-[rgba(255,244,241,0.86)] px-4 py-3 text-sm text-[#7b3024] shadow-[0_10px_24px_rgba(123,48,36,0.08)]">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
