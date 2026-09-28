import { ChevronDown, Search, Trash2 } from "lucide-react";
import { PRESET_SUBJECT_HEX } from "@/app/_home/constants";
import { FieldBox, fieldInput, GroupBadge, GroupChips } from "@/app/_home/components/controls";
import type { SubjectItem } from "@/app/_home/types";
import {
  displayName,
  formatImportTimestampLabel,
  groupKeys,
  minutesToLabel,
  overlaps,
  summarizeSessions,
  timeToMinutes,
} from "@/app/_home/utils";
import type { TimetableEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

type SubjectRowProps = {
  item: SubjectItem;
  color: string;
  colorDraft: string;
  expanded: boolean;
  /** Selected entries of every other subject. */
  others: TimetableEntry[];
  onToggle: () => void;
  onRemove: () => void;
  onSelectGroup: (group: string) => void;
  onSetGroupFilter: (value: string) => void;
  onSetColor: (value: string) => void;
  onSetColorDraft: (value: string) => void;
  onCommitColorDraft: () => void;
};

export function SubjectRow({
  item,
  color,
  colorDraft,
  expanded,
  others,
  onToggle,
  onRemove,
  onSelectGroup,
  onSetGroupFilter,
  onSetColor,
  onSetColorDraft,
  onCommitColorDraft,
}: SubjectRowProps) {
  const groups = groupKeys(item.grouped);
  const selectedEntries = item.selectedGroup ? item.grouped?.[item.selectedGroup] ?? [] : [];
  const clash = selectedEntries
    .map((entry) => ({ entry, other: others.find((other) => overlaps(entry, other)) }))
    .find(({ other }) => other);
  const query = item.groupFilter.trim().toLowerCase();
  const visibleGroups = query ? groups.filter((group) => group.toLowerCase().includes(query)) : groups;
  const panelId = `subject-${item.id}`;

  const meta = [
    ["Source", item.source === "mystudent" ? "MyStudent" : "Manual search"],
    item.request ? ["Campus", item.request.campus] : null,
    item.request?.faculty ? ["Faculty", item.request.faculty] : null,
    item.importedAt ? ["Imported", formatImportTimestampLabel(item.importedAt)] : null,
  ].filter((row): row is [string, string] => Boolean(row));

  return (
    <li className={cn(expanded && "bg-foreground/[0.03]")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="relative flex w-full items-center gap-3 py-3.5 pr-6 pl-9 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
      >
        <span aria-hidden="true" className="absolute top-1/2 left-4 h-9 w-1 -translate-y-1/2 rounded-full" style={{ background: color }} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm">
            <span className="font-semibold">{item.course}</span>{" "}
            <span className="text-muted-foreground">{displayName(item.subjectName ?? "")}</span>
          </span>
          <span className={cn("block truncate text-xs", clash ? "text-destructive" : "text-faint")}>
            {clash
              ? `${clash.entry.day.slice(0, 3)} ${minutesToLabel(timeToMinutes(clash.entry.start))} clashes with ${clash.other!.course}`
              : summarizeSessions(selectedEntries) || "Pick a group"}
          </span>
        </span>
        {item.selectedGroup ? <GroupBadge group={item.selectedGroup} clash={Boolean(clash)} /> : null}
        <ChevronDown aria-hidden="true" className={cn("size-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded ? (
        <div id={panelId} className="space-y-5 pr-6 pb-5 pl-9">
          <dl className="flex flex-wrap gap-x-6 gap-y-2">
            {meta.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-faint">{label}</dt>
                <dd className="text-[13px]">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <p className="text-xs font-medium text-muted-foreground">Group</p>
              {groups.length > 4 ? (
                <FieldBox label="Filter groups" htmlFor={`${panelId}-filter`} icon={<Search aria-hidden="true" />} className="w-full py-1 sm:w-[220px]">
                  <input
                    id={`${panelId}-filter`}
                    value={item.groupFilter}
                    onChange={(event) => onSetGroupFilter(event.target.value)}
                    placeholder="e.g. CS24"
                    className={fieldInput}
                  />
                </FieldBox>
              ) : null}
            </div>
            {item.grouped && visibleGroups.length > 0 ? (
              <GroupChips grouped={item.grouped} groups={visibleGroups} selected={item.selectedGroup} others={others} onSelect={onSelectGroup} />
            ) : (
              <p className="text-sm text-muted-foreground">No groups match.</p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">Colour</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
              {PRESET_SUBJECT_HEX.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => onSetColor(hex)}
                  aria-label={`Use colour ${hex}`}
                  aria-pressed={color.toLowerCase() === hex}
                  className="size-6 rounded-full ring-offset-2 ring-offset-card transition-transform hover:scale-110 aria-pressed:ring-2 aria-pressed:ring-foreground"
                  style={{ background: hex }}
                />
              ))}
              <input
                value={colorDraft}
                onChange={(event) => onSetColorDraft(event.target.value)}
                onBlur={onCommitColorDraft}
                aria-label={`Hex colour for ${item.course}`}
                className="h-7 w-[84px] rounded-md bg-muted px-2 font-mono text-xs uppercase outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onCommitColorDraft();
                onToggle();
              }}
              className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Save
            </button>
            <button type="button" onClick={onRemove} className="inline-flex h-9 items-center gap-2 rounded-lg bg-destructive/15 px-4 text-sm font-medium text-destructive hover:bg-destructive/25">
              <Trash2 aria-hidden="true" className="size-4" />
              Remove subject
            </button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
