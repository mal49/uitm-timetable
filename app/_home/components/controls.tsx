import type { ReactNode } from "react";
import type { GroupedTimetable, TimetableEntry } from "@/lib/types";
import { clashingCourse, summarizeSessions } from "@/app/_home/utils";
import { cn } from "@/lib/utils";

type FieldBoxProps = {
  label: string;
  htmlFor?: string;
  icon?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
};

/** HeroUI "flat" input: label sits inside the filled box, above the value. */
export function FieldBox({ label, htmlFor, icon, error, className, children }: FieldBoxProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col justify-center rounded-xl border-2 border-transparent bg-muted px-3 py-1.5 transition-colors focus-within:border-primary",
        error && "bg-destructive/15",
        className,
      )}
    >
      <label htmlFor={htmlFor} className="text-xs text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-faint">
        {icon}
        {children}
      </div>
      {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export const fieldInput =
  "w-full min-w-0 bg-transparent py-0.5 text-[15px] text-foreground outline-none placeholder:text-faint";

type GroupChipsProps = {
  grouped: GroupedTimetable;
  groups: string[];
  selected: string | null;
  /** Entries of the other subjects, for "Clashes with …" hints. */
  others: TimetableEntry[];
  onSelect: (group: string) => void;
};

export function GroupChips({ grouped, groups, selected, others, onSelect }: GroupChipsProps) {
  return (
    <div role="radiogroup" aria-label="Group" className="flex flex-wrap gap-2">
      {groups.map((group) => {
        const entries = grouped[group] ?? [];
        const active = group === selected;
        const clash = active ? null : clashingCourse(entries, others);
        return (
          <button
            key={group}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(group)}
            className={cn(
              "flex flex-col items-start rounded-xl px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              active
                ? "bg-primary text-primary-foreground"
                : clash
                  ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
                  : "bg-surface-3/70 hover:bg-surface-3",
            )}
          >
            <span className="text-[13px] font-medium">{group}</span>
            <span className={cn("text-xs", active ? "text-primary-foreground/85" : clash ? "" : "text-muted-foreground")}>
              {clash ? `Clashes with ${clash}` : summarizeSessions(entries) || "No sessions"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function GroupBadge({ group, clash }: { group: string; clash?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        clash ? "bg-destructive/20 text-destructive" : "bg-primary-soft text-primary-soft-foreground",
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {group}
    </span>
  );
}
