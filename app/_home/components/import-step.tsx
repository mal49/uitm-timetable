"use client";

import { useState } from "react";
import { MyStudentImportPanel } from "@/app/_home/components/mystudent-import-panel";
import { SearchForm } from "@/app/_home/components/search-form";
import type { HomePageState } from "@/app/_home/use-home-page";
import { Segmented } from "@/components/ui/segmented";
import { cn } from "@/lib/utils";

type Tab = "id" | "search";

type ImportStepProps = {
  home: HomePageState;
  /** From the landing page: /app?id=… and /app?tab=search */
  initialStudentId?: string;
  initialTab: Tab;
};

export function ImportStep({ home, initialStudentId, initialTab }: ImportStepProps) {
  const [tab, setTab] = useState<Tab>(initialTab);

  const saved = home.savedImport;
  const savedImportLabel = saved
    ? `${saved.summary.subjectCount} subjects, ${saved.summary.sessionCount} sessions saved on this device${
        saved.importedAt ? ` · ${home.formatImportTimestampLabel(saved.importedAt)}` : ""
      }`
    : undefined;

  return (
    <div className="px-4">
      <section
        aria-labelledby="import-title"
        className={cn(
          "mx-auto mt-6 rounded-[20px] border border-border bg-card p-5 sm:mt-12 sm:p-7",
          tab === "id" ? "max-w-[640px]" : "max-w-[860px]",
        )}
      >
        <h1 id="import-title" className="text-2xl font-bold tracking-[-0.01em]">
          {tab === "id" ? "Import your timetable" : "Find your subjects"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {tab === "id"
            ? "Pull your registered classes straight from MyStudent."
            : "Search the UiTM timetable by campus, faculty and course code."}
        </p>
        <Segmented
          label="Import method"
          value={tab}
          onChange={setTab}
          options={[
            { value: "id", label: "Student ID" },
            { value: "search", label: "Manual search" },
          ]}
          className="mt-6 mb-5"
        />
        {tab === "id" ? (
          <MyStudentImportPanel
            onConfirmImport={home.handleConfirmMyStudentImport}
            savedImportLabel={savedImportLabel}
            onRestoreSavedImport={home.handleRestoreSavedImport}
            onClearSavedImport={home.handleClearSavedImport}
            onSearchManually={() => setTab("search")}
            initialStudentId={initialStudentId}
          />
        ) : (
          <SearchForm
            addedPaths={new Set(home.items.flatMap((item) => (item.selectedPath ? [item.selectedPath] : [])))}
            entries={home.combinedEntries}
            onAdd={home.addSearchedSubject}
          />
        )}
      </section>
    </div>
  );
}
