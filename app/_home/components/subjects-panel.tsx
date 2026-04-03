import { CalendarX2 } from "lucide-react";
import type { SubjectItem } from "@/app/_home/types";
import { SubjectCard } from "@/app/_home/components/subject-card";

type SubjectsPanelProps = {
  items: SubjectItem[];
  subjectColorOverrides: Record<string, string>;
  subjectColorDrafts: Record<string, string>;
  groupKeys: (grouped?: SubjectItem["grouped"]) => string[];
  onRemoveItem: (itemId: string) => void;
  onSetSubjectColor: (course: string, value: string) => void;
  onSetSubjectColorDraft: (course: string, value: string) => void;
  onCommitSubjectColorDraft: (course: string) => void;
  onChooseMatch: (itemId: string, path: string) => void;
  onToggleShowSelectedOnly: (itemId: string) => void;
  onClearGroups: (itemId: string) => void;
  onSetGroupFilter: (itemId: string, value: string) => void;
  onSelectGroup: (itemId: string, group: string) => void;
};

export function SubjectsPanel({
  items,
  subjectColorOverrides,
  subjectColorDrafts,
  groupKeys,
  onRemoveItem,
  onSetSubjectColor,
  onSetSubjectColorDraft,
  onCommitSubjectColorDraft,
  onChooseMatch,
  onToggleShowSelectedOnly,
  onClearGroups,
  onSetGroupFilter,
  onSelectGroup,
}: SubjectsPanelProps) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-[0_24px_60px_rgba(31,41,55,0.08)] ring-1 ring-slate-200/70 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Subjects
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            Build your schedule
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Pick the right subject result, lock in your groups, and set colors before
            sending everything into the wallpaper maker.
          </p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="-mr-1 mt-5 grid max-h-140 gap-3 overflow-y-auto pr-1 sm:-mr-2 sm:pr-2 xl:grid-cols-2">
          {items.map((item) => (
            <SubjectCard
              key={item.id}
              item={item}
              groups={groupKeys(item.grouped)}
              colorValue={subjectColorOverrides[item.course] ?? ""}
              colorDraft={subjectColorDrafts[item.course] ?? subjectColorOverrides[item.course] ?? ""}
              onRemove={onRemoveItem}
              onSetColor={onSetSubjectColor}
              onSetColorDraft={onSetSubjectColorDraft}
              onCommitColorDraft={onCommitSubjectColorDraft}
              onChooseMatch={onChooseMatch}
              onToggleShowSelectedOnly={onToggleShowSelectedOnly}
              onClearGroups={onClearGroups}
              onSetGroupFilter={onSetGroupFilter}
              onSelectGroup={onSelectGroup}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 flex min-h-70 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-[#faf7f0] px-5 py-10 text-center">
          <CalendarX2 className="h-10 w-10 text-slate-300" />
          <p className="mt-3 text-base font-semibold text-slate-900">
            No subjects added yet
          </p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Add your first course code above to start building your schedule
            wallpaper.
          </p>
        </div>
      )}
    </div>
  );
}
