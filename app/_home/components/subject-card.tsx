import { AlertCircle, Search, Trash2, X } from "lucide-react";
import { PRESET_SUBJECT_HEX } from "@/app/_home/constants";
import type { SubjectItem } from "@/app/_home/types";
import { formatImportTimestampLabel } from "@/app/_home/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimetableGridSkeleton } from "@/components/timetable-grid";

type SubjectCardProps = {
  item: SubjectItem;
  groups: string[];
  colorValue: string;
  colorDraft: string;
  onRemove: (itemId: string) => void;
  onSetColor: (course: string, value: string) => void;
  onSetColorDraft: (course: string, value: string) => void;
  onCommitColorDraft: (course: string) => void;
  onChooseMatch: (itemId: string, path: string) => void;
  onToggleShowSelectedOnly: (itemId: string) => void;
  onClearGroups: (itemId: string) => void;
  onSetGroupFilter: (itemId: string, value: string) => void;
  onSelectGroup: (itemId: string, group: string) => void;
};

export function SubjectCard({
  item,
  groups,
  colorValue,
  colorDraft,
  onRemove,
  onSetColor,
  onSetColorDraft,
  onCommitColorDraft,
  onChooseMatch,
  onToggleShowSelectedOnly,
  onClearGroups,
  onSetGroupFilter,
  onSelectGroup,
}: SubjectCardProps) {
  const hasGroups = groups.length > 0;
  const hasSelection = Boolean(item.selectedGroup);
  const ready = item.status === "ready";

  return (
    <div className="min-w-0 rounded-[1.5rem] border border-slate-200 bg-[#fffdf9] p-4 shadow-sm">
      <div className="min-w-0 space-y-3">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="inline-flex max-w-full shrink-0 rounded-full bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold leading-none text-white">
                {item.course}
              </span>
              {item.subjectName && item.subjectName !== item.course ? (
                <span className="min-w-0 wrap-break-word text-xs text-slate-500 sm:text-sm">
                  {item.subjectName}
                </span>
              ) : null}
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 sm:text-xs">
              {item.request ? (
                <>
                  <p className="min-w-0">
                    Campus:{" "}
                    <span className="font-mono text-slate-700">
                      {item.request.campus}
                    </span>
                  </p>
                  <span className="text-slate-300">•</span>
                  <p className="min-w-0">
                    Faculty:{" "}
                    <span className="font-mono text-slate-700">
                      {item.request.faculty || "—"}
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <p className="min-w-0">
                    Source:{" "}
                    <span className="font-mono text-slate-700">MyStudent</span>
                  </p>
                  {item.importedAt ? (
                    <>
                      <span className="text-slate-300">•</span>
                      <p className="min-w-0">
                        Imported:{" "}
                        <span className="font-mono text-slate-700">
                          {formatImportTimestampLabel(item.importedAt)}
                        </span>
                      </p>
                    </>
                  ) : null}
                  {item.exportedAt ? (
                    <>
                      <span className="text-slate-300">•</span>
                      <p className="min-w-0">
                        Exported:{" "}
                        <span className="font-mono text-slate-700">
                          {formatImportTimestampLabel(item.exportedAt)}
                        </span>
                      </p>
                    </>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="justify-start gap-2 self-start rounded-full px-0 text-slate-500 hover:bg-transparent hover:text-slate-900 sm:px-3 sm:hover:bg-slate-100"
          >
            <Trash2 className="h-4 w-4 shrink-0" />
            <span>Remove</span>
          </Button>
        </div>

        <div className="w-full min-w-0 rounded-2xl bg-slate-100 px-3 py-2 sm:max-w-65">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Color
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {PRESET_SUBJECT_HEX.map((hex, index) => {
              const selected = colorValue.toLowerCase() === hex.toLowerCase();
              return (
                <button
                  key={`${item.course}-color-${index}`}
                  type="button"
                  onClick={() => onSetColor(item.course, hex)}
                  aria-label={`Set ${item.course} color ${index + 1}`}
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
                style={{ backgroundColor: colorValue || "#14b8a6" }}
              />
              <input
                type="color"
                value={colorValue || "#14b8a6"}
                onChange={(event) => onSetColor(item.course, event.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label={`Pick custom color for ${item.course}`}
              />
            </label>
          </div>

          <input
            type="text"
            inputMode="text"
            value={colorDraft}
            placeholder="#22c55e"
            onChange={(event) => onSetColorDraft(item.course, event.target.value)}
            onBlur={() => onCommitColorDraft(item.course)}
            className="mt-2 h-8 w-28 rounded-lg border border-slate-300 bg-white px-2 text-[11px] font-mono text-slate-700"
            aria-label={`Hex color for ${item.course}`}
          />
        </div>
      </div>

      {item.status === "loading_subjects" || item.status === "loading_timetable" ? (
        <div className="mt-4">
          <TimetableGridSkeleton />
        </div>
      ) : null}

      {item.status === "error" ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-rose-700">Failed</p>
            <p className="text-xs text-slate-600">
              {item.error ?? "Unknown error"}
            </p>
          </div>
        </div>
      ) : null}

      {item.status === "choose_subject" ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-slate-900">
            Pick the correct subject result
          </p>
          <select
            value={item.selectedPath ?? ""}
            onChange={(event) => onChooseMatch(item.id, event.target.value)}
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900"
          >
            <option value="" disabled>
              Select a result...
            </option>
            {item.matches.map((match) => (
              <option key={match.path} value={match.path}>
                {match.subject || item.course}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {ready ? (
        <div className="mt-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-900">
              Groups{" "}
              {hasGroups ? <span className="text-slate-500">({groups.length})</span> : null}
            </p>
            {hasGroups ? (
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <button
                  onClick={() => onToggleShowSelectedOnly(item.id)}
                  className="text-xs text-slate-500 transition-colors hover:text-slate-900"
                >
                  {item.showSelectedOnly ? "Show all" : "Selected only"}
                </button>
                {hasSelection ? (
                  <button
                    onClick={() => onClearGroups(item.id)}
                    className="text-xs font-medium text-teal-700 transition-colors hover:text-teal-600"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {!hasGroups ? (
            <p className="text-sm text-slate-500">No groups found for this subject.</p>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={item.groupFilter}
                  onChange={(event) => onSetGroupFilter(item.id, event.target.value)}
                  placeholder="Filter groups... (e.g. A, CDCS2306, 2406B)"
                  className="border-slate-300 bg-white pl-9 pr-9 text-slate-900"
                />
                {item.groupFilter.trim() ? (
                  <button
                    onClick={() => onSetGroupFilter(item.id, "")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-900"
                    aria-label="Clear group filter"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {groups
                  .filter((group) => {
                    const query = item.groupFilter.trim().toLowerCase();
                    if (item.showSelectedOnly && item.selectedGroup !== group) return false;
                    if (!query) return true;

                    return (
                      group.toLowerCase().includes(query) ||
                      `${item.course} ${group}`.toLowerCase().includes(query)
                    );
                  })
                  .map((group) => (
                    <label
                      key={group}
                      className="flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 transition-colors hover:bg-slate-50"
                    >
                      <input
                        type="radio"
                        name={`group-${item.id}`}
                        checked={item.selectedGroup === group}
                        onChange={() => onSelectGroup(item.id, group)}
                        className="h-3.5 w-3.5 cursor-pointer rounded accent-teal-500"
                      />
                      <span className="min-w-0 flex-1 wrap-break-word font-mono text-xs text-slate-800">
                        {item.course} <span className="font-semibold">{group}</span>
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
