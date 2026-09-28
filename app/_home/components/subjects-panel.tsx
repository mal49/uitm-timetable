import { CalendarX2, CircleCheck, Clock, Plus, TriangleAlert, Wand2 } from "lucide-react";
import type { ReactNode } from "react";
import { SubjectRow } from "@/app/_home/components/subject-card";
import type { HomePageState } from "@/app/_home/use-home-page";
import { minutesToLabel, timeToMinutes } from "@/app/_home/utils";
import { cn } from "@/lib/utils";

const WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function SubjectsStep({ home }: { home: HomePageState }) {
  const imported = home.items.find((item) => item.source === "mystudent");
  const subtitle = imported
    ? `Imported from MyStudent${imported.importedAt ? ` · ${home.formatImportTimestampLabel(imported.importedAt)}` : ""}`
    : `${home.items.length} subject${home.items.length === 1 ? "" : "s"} in your build`;

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-8">
      <section aria-labelledby="subjects-title" className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 id="subjects-title" className="text-2xl font-bold tracking-[-0.01em]">Your subjects</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex gap-2">
            {home.items.length > 0 ? (
              <button type="button" onClick={home.clearAll} className="h-10 rounded-xl px-4 text-sm hover:bg-muted">
                Clear all
              </button>
            ) : null}
            <button type="button" onClick={() => home.setStep(0)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-muted px-4 text-sm font-medium hover:bg-surface-3">
              <Plus aria-hidden="true" className="size-4" />
              Add subject
            </button>
          </div>
        </div>

        {home.items.length > 0 ? (
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-[20px] border border-border bg-card">
            {home.items.map((item) => (
              <SubjectRow
                key={item.id}
                item={item}
                color={home.subjectColors[item.course] ?? "#b9a3f0"}
                colorDraft={home.subjectColorDrafts[item.course] ?? home.subjectColors[item.course] ?? ""}
                expanded={home.expandedId === item.id}
                others={home.combinedEntries.filter((entry) => entry.course !== item.course)}
                onToggle={() => home.setExpandedId(home.expandedId === item.id ? null : item.id)}
                onRemove={() => home.removeItem(item.id)}
                onSelectGroup={(group) => home.selectGroup(item.id, group)}
                onSetGroupFilter={(value) => home.setGroupFilter(item.id, value)}
                onSetColor={(value) => home.setSubjectColor(item.course, value)}
                onSetColorDraft={(value) => home.setSubjectColorDraft(item.course, value)}
                onCommitColorDraft={() => home.commitSubjectColorDraft(item.course)}
              />
            ))}
          </ul>
        ) : (
          <div className="mt-4 flex flex-col items-center rounded-[20px] border border-border bg-card px-6 py-14 text-center">
            <CalendarX2 aria-hidden="true" className="size-8 text-faint" />
            <p className="mt-3 font-semibold">No subjects yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Import with your student ID or search by course code.</p>
          </div>
        )}
      </section>

      <aside aria-label="Checks" className="space-y-3 lg:pt-[3px]">
        <Checks home={home} />
        {home.clashFix ? (
          <button
            type="button"
            onClick={() => home.selectGroup(home.clashFix!.itemId, home.clashFix!.group)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/15 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/25"
          >
            <Wand2 aria-hidden="true" className="size-4" />
            Fix clash: switch {home.clashFix.course} to {home.clashFix.group}
          </button>
        ) : null}
      </aside>
    </div>
  );
}

function Checks({ home }: { home: HomePageState }) {
  const entries = home.combinedEntries;
  const pairs = home.clashPairs;
  const missingGroup = home.items.filter((item) => !item.selectedGroup).length;
  const starts = entries.map((entry) => timeToMinutes(entry.start));
  const ends = entries.map((entry) => timeToMinutes(entry.end));
  const freeDays = WEEK.filter((day) => !entries.some((entry) => entry.day === day));

  const clashDays = [...new Set(pairs.map(({ a }) => a.day))];
  const first = pairs[0];

  return (
    <div className="rounded-[20px] border border-border bg-card p-5">
      <h2 className="text-[17px] font-semibold">Checks</h2>
      <ul className="mt-4 space-y-4">
        {first ? (
          <Check tone="danger" icon={<TriangleAlert />} title={`${pairs.length} clash${pairs.length === 1 ? "" : "es"} on ${clashDays.join(", ")}`}>
            {first.b.section} overlaps {first.a.course} at {minutesToLabel(Math.max(timeToMinutes(first.a.start), timeToMinutes(first.b.start)))}.
            {home.clashFix ? ` Pick ${home.clashFix.group} for ${home.clashFix.course} to fix it.` : ""}
          </Check>
        ) : (
          <Check tone="success" icon={<CircleCheck />} title="No clashes">
            All groups fit your week.
          </Check>
        )}
        {missingGroup > 0 ? (
          <Check tone="warning" icon={<TriangleAlert />} title={`${missingGroup} subject${missingGroup === 1 ? " needs" : "s need"} a group`}>
            Open a subject and pick a group to add it to your canvas.
          </Check>
        ) : entries.length > 0 ? (
          <Check tone="success" icon={<CircleCheck />} title="Every subject has a group">
            {entries.length} sessions in your build.
          </Check>
        ) : null}
        {entries.length > 0 ? (
          <Check tone="info" icon={<Clock />} title={`Earliest class ${minutesToLabel(Math.min(...starts))}`}>
            Latest ends {minutesToLabel(Math.max(...ends))}
            {freeDays.length > 0 ? ` · ${freeDays.join(", ")} free` : ""}
          </Check>
        ) : null}
      </ul>
    </div>
  );
}

const TONES = {
  danger: "bg-destructive/15 text-destructive",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/15 text-info",
};

function Check({ tone, icon, title, children }: { tone: keyof typeof TONES; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden="true" className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4", TONES[tone])}>{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs leading-[1.5] text-muted-foreground">{children}</p>
      </div>
    </li>
  );
}
