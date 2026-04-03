import { CalendarX2, LayoutGrid, List, Loader2 } from "lucide-react";
import type { ViewMode } from "@/app/_home/types";
import { Button } from "@/components/ui/button";
import { TimetableGrid } from "@/components/timetable-grid";
import { TimetableTable } from "@/components/timetable-table";
import { WallpaperMaker } from "@/components/wallpaper-maker-v2/wallpaper-maker";
import type { TimetableEntry } from "@/lib/types";

type TimetableSectionProps = {
  itemsCount: number;
  combinedEntries: TimetableEntry[];
  displayedEntries: TimetableEntry[];
  clashCount: number;
  viewMode: ViewMode;
  showClashesOnly: boolean;
  exporting: boolean;
  exportError: string;
  subjectColorOverrides: Record<string, string>;
  timetableRef: React.RefObject<HTMLDivElement | null>;
  exportRef: React.RefObject<HTMLDivElement | null>;
  onSetViewMode: (mode: ViewMode) => void;
  onToggleClashesOnly: () => void;
  onExportTimetable: () => void;
};

function ClashToggle({
  clashCount,
  showClashesOnly,
  onToggle,
}: {
  clashCount: number;
  showClashesOnly: boolean;
  onToggle: () => void;
}) {
  if (clashCount === 0) return null;

  return (
    <div className="flex items-center justify-start lg:justify-end">
      <button
        onClick={onToggle}
        className="text-xs text-white/65 transition-colors hover:text-white"
      >
        {showClashesOnly ? "Show all sessions" : "Show only clashes"}
      </button>
    </div>
  );
}

export function TimetableSection({
  itemsCount,
  combinedEntries,
  displayedEntries,
  clashCount,
  viewMode,
  showClashesOnly,
  exporting,
  exportError,
  subjectColorOverrides,
  timetableRef,
  exportRef,
  onSetViewMode,
  onToggleClashesOnly,
  onExportTimetable,
}: TimetableSectionProps) {
  if (itemsCount === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#2e1d52_0%,#17182d_100%)] py-12 text-white sm:py-16">
      {combinedEntries.length > 0 ? (
        <div
          aria-hidden="true"
          className="fixed -left-2500 top-0 pointer-events-none opacity-0"
        >
          <div ref={exportRef} style={{ width: 1200 }} className="bg-background p-4">
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

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(125,244,195,0.12),transparent_30%)]" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {combinedEntries.length === 0 ? (
          <div className="flex min-h-65 flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-white/8 px-5 py-12 text-center backdrop-blur-sm">
            <CalendarX2 className="h-10 w-10 text-white/35" />
            <p className="mt-3 text-lg font-semibold text-white">
              Select groups to generate your class canvas
            </p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/70">
              Pick at least one group for each subject you want included in the
              wallpaper.
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
                  {displayedEntries.length !== 1 ? "s" : ""} ready for timetable
                  view and wallpaper export
                  {clashCount > 0 ? (
                    <span className="ml-2 font-medium text-[#ff8e8e]">
                      {clashCount} clash{clashCount !== 1 ? "es" : ""}
                    </span>
                  ) : null}
                </p>
                {exportError ? (
                  <p className="mt-1 text-xs text-[#ffb4b4]">{exportError}</p>
                ) : null}
              </div>

              <div className="hidden w-full flex-col items-stretch gap-2 sm:flex sm:w-auto sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
                <div className="relative z-10 grid w-full grid-cols-2 gap-1 rounded-full bg-white/10 p-1 pointer-events-auto sm:flex sm:w-auto sm:items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSetViewMode("grid")}
                    className={`relative z-10 h-8 w-full gap-1.5 rounded-full border-0 pointer-events-auto sm:w-auto ${
                      viewMode === "grid"
                        ? "bg-white text-slate-900 hover:bg-white/90"
                        : "bg-transparent text-white hover:bg-white/10"
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Week
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSetViewMode("table")}
                    className={`relative z-10 h-8 w-full gap-1.5 rounded-full border-0 pointer-events-auto sm:w-auto ${
                      viewMode === "table"
                        ? "bg-white text-slate-900 hover:bg-white/90"
                        : "bg-transparent text-white hover:bg-white/10"
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                    List
                  </Button>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onExportTimetable}
                  disabled={exporting}
                  className="relative z-10 h-9 w-full gap-2 rounded-full border-0 bg-[#21d4cf] px-4 font-semibold text-slate-950 pointer-events-auto shadow-[0_12px_24px_rgba(33,212,207,0.2)] hover:bg-[#3fe1dc] sm:w-auto"
                >
                  {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Export JPG
                </Button>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="hidden space-y-2 sm:block">
                <ClashToggle
                  clashCount={clashCount}
                  showClashesOnly={showClashesOnly}
                  onToggle={onToggleClashesOnly}
                />
                <div
                  ref={timetableRef}
                  className="w-full rounded-[2rem] bg-white p-2 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:p-3"
                >
                  <TimetableGrid
                    entries={displayedEntries}
                    course="MY"
                    colorOverrides={subjectColorOverrides}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <ClashToggle
                  clashCount={clashCount}
                  showClashesOnly={showClashesOnly}
                  onToggle={onToggleClashesOnly}
                />
                <div
                  ref={timetableRef}
                  className="w-full rounded-[2rem] bg-white p-2 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:p-3"
                >
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
  );
}
