"use client";

import { useEffect, useState } from "react";
import { History, IdCard, Loader2, RefreshCw, RotateCcw, WifiOff } from "lucide-react";
import { FieldBox, fieldInput } from "@/app/_home/components/controls";
import {
  type MyStudentImportResult,
  parseMyStudentImportData,
} from "@/lib/importers/mystudent";
import { cn } from "@/lib/utils";

type MyStudentImportPanelProps = {
  onConfirmImport: (result: MyStudentImportResult) => void;
  savedImportLabel?: string;
  onRestoreSavedImport: () => void;
  onClearSavedImport: () => void;
  onSearchManually: () => void;
  initialStudentId?: string;
};

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "invalid"; message: string }
  | { kind: "unavailable" };

class NotFoundError extends Error {}

export function MyStudentImportPanel({
  onConfirmImport,
  savedImportLabel,
  onRestoreSavedImport,
  onClearSavedImport,
  onSearchManually,
  initialStudentId,
}: MyStudentImportPanelProps) {
  const [studentId, setStudentId] = useState(initialStudentId ?? "");
  const [state, setState] = useState<LoadState>({ kind: "idle" });

  async function load(id: string) {
    if (!/^\d+$/.test(id)) {
      setState({ kind: "invalid", message: "Enter your numeric student ID." });
      return;
    }

    setState({ kind: "loading" });
    try {
      const response = await fetch(`/api/mystudent?studentId=${encodeURIComponent(id)}`, { cache: "no-store" });
      const json = (await response.json()) as Record<string, unknown>;
      if (response.status === 404) throw new NotFoundError();
      if (!response.ok) throw new Error(String(json.error ?? "Upstream error"));

      const result = parseMyStudentImportData(json);
      setState({ kind: "idle" });
      onConfirmImport(result);
    } catch (err) {
      setState(
        err instanceof NotFoundError
          ? { kind: "invalid", message: "No timetable found for this ID. Check your matric card." }
          : { kind: "unavailable" },
      );
    }
  }

  // The landing page hands the ID over as /app?id=…; load it once, then drop it
  // from the URL so a refresh doesn't re-import.
  useEffect(() => {
    if (!initialStudentId || !new URLSearchParams(window.location.search).has("id")) return;
    window.history.replaceState(null, "", window.location.pathname);
    void load(initialStudentId);
    // Mount-only: consume the handed-over ID once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loading = state.kind === "loading";
  const hasSaved = Boolean(savedImportLabel);

  return (
    <div className="space-y-6">
      {hasSaved && !loading ? (
        <div className="flex gap-3 rounded-xl bg-primary-soft p-4">
          <History aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary-soft-foreground">Welcome back</p>
            <p className="mt-1 text-[13px] text-foreground">{savedImportLabel}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={onRestoreSavedImport} className="inline-flex h-8 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90">
                <RotateCcw aria-hidden="true" className="size-4" />
                Restore
              </button>
              <button type="button" onClick={onClearSavedImport} className="h-8 rounded-lg px-3 text-sm text-muted-foreground hover:bg-surface-3 hover:text-foreground">
                Clear
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!loading) void load(studentId.trim());
        }}
      >
        <FieldBox
          label="Student ID"
          htmlFor="student-id"
          icon={<IdCard aria-hidden="true" />}
          error={state.kind === "invalid" ? state.message : undefined}
          className="flex-1"
        >
          <input
            id="student-id"
            value={studentId}
            onChange={(event) => {
              setStudentId(event.target.value.replace(/[^\d]/g, ""));
              if (state.kind === "invalid") setState({ kind: "idle" });
            }}
            inputMode="numeric"
            autoComplete="off"
            placeholder="e.g. 2023456789"
            aria-invalid={state.kind === "invalid"}
            className={fieldInput}
          />
        </FieldBox>
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "inline-flex min-h-14 shrink-0 items-center gap-2 self-stretch rounded-xl px-6 text-sm font-medium transition-opacity hover:opacity-90",
            hasSaved && !loading ? "bg-muted text-foreground hover:bg-surface-3" : "bg-primary text-primary-foreground",
          )}
        >
          {loading ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
          {loading ? "Loading" : "Load"}
        </button>
      </form>

      {loading ? (
        <div aria-live="polite" className="space-y-5">
          <div>
            <p className="text-[13px] text-muted-foreground">Fetching from MyStudent…</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full w-2/5 animate-[indeterminate_1.4s_ease-in-out_infinite] rounded-full bg-linear-to-r from-primary to-info" />
            </div>
          </div>
          {[220, 170, 200].map((width) => (
            <div key={width} aria-hidden="true" className="flex h-[34px] items-center gap-3 rounded-lg bg-muted px-4">
              <span className="size-2 rounded-full bg-surface-3" />
              <span className="h-2 animate-pulse rounded-full bg-surface-3" style={{ width }} />
            </div>
          ))}
        </div>
      ) : state.kind === "unavailable" ? (
        <div role="alert" className="flex gap-3 rounded-xl bg-warning/15 p-4">
          <WifiOff aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-semibold text-warning">MyStudent isn&apos;t responding</p>
            <p className="mt-1 text-[13px] leading-5 text-foreground">
              The portal often slows down during registration week. Try again in a minute, or add subjects by course code.
            </p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => void load(studentId.trim())} className="inline-flex h-8 items-center gap-2 rounded-lg bg-warning px-3 text-sm font-medium text-black hover:opacity-90">
                <RefreshCw aria-hidden="true" className="size-4" />
                Try again
              </button>
              <button type="button" onClick={onSearchManually} className="h-8 rounded-lg px-3 text-sm font-medium text-warning hover:bg-warning/15">
                Search manually
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-faint">
          {hasSaved ? "Loading again replaces the saved build." : "Only your student ID is used. Nothing is stored on our side."}
        </p>
      )}
    </div>
  );
}
