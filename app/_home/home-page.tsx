"use client";

import { AlertCircle, GraduationCap } from "lucide-react";
import { HomeSidebar } from "@/app/_home/components/home-sidebar";
import { MyStudentImportPanel } from "@/app/_home/components/mystudent-import-panel";
import { SearchForm } from "@/app/_home/components/search-form";
import { SiteFooter } from "@/app/_home/components/site-footer";
import { SubjectsPanel } from "@/app/_home/components/subjects-panel";
import { TimetableSection } from "@/app/_home/components/timetable-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useHomePage } from "@/app/_home/use-home-page";

export function HomePage() {
  const home = useHomePage();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f7f3ea] text-slate-900">
      <div className="absolute inset-x-0 top-0 h-190 bg-[radial-gradient(circle_at_top_left,rgba(168,245,229,0.18),transparent_20%),radial-gradient(circle_at_top_right,rgba(111,211,255,0.18),transparent_24%),linear-gradient(180deg,#061b1d_0%,#10263a_38%,#39255a_72%,#5e3f86_100%)]" />

      <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-[1.75rem] border border-white/55 bg-white/92 px-5 py-3 text-slate-900 shadow-[0_18px_40px_rgba(45,88,135,0.12)] backdrop-blur-xl sm:px-7 sm:py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 ring-1 ring-cyan-200">
              <GraduationCap className="h-4 w-4 text-cyan-700" />
            </div>
            <span className="text-sm font-semibold tracking-tight sm:text-base">
              UiTM Schedule
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Malaysia
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="relative z-20 pb-16 pt-10 text-white sm:pb-20 sm:pt-12">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
                Turn Your Schedule
                <span className="block text-[#7df4c3]">into a wallpaper</span>
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/72 sm:text-base">
                Search subjects, choose the right groups, and generate a custom
                wallpaper from your final class schedule.
              </p>
            </div>

            <div className="mx-auto w-full max-w-4xl">
              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-[0_26px_60px_rgba(5,10,25,0.18)] backdrop-blur-md sm:p-6">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">
                    Build your schedule
                  </p>
                  <p className="text-xs leading-5 text-white/65 sm:text-sm">
                    Search by campus, faculty, and course code.
                  </p>
                </div>
                <div className="mt-4">
                  <MyStudentImportPanel
                    onConfirmImport={home.handleConfirmMyStudentImport}
                    hasSavedImport={Boolean(home.savedImport)}
                    savedImportLabel={
                      home.savedImport
                        ? `Latest import: ${home.savedImport.summary.subjectCount} subjects, ${home.savedImport.summary.sessionCount} sessions${
                            home.savedImport.importedAt
                              ? `, restored from ${home.formatImportTimestampLabel(home.savedImport.importedAt)}`
                              : ""
                          }`
                        : undefined
                    }
                    onRestoreSavedImport={home.handleRestoreSavedImport}
                    onClearSavedImport={home.handleClearSavedImport}
                  />
                </div>
                <div className="mt-4">
                  <Accordion multiple className="w-full">
                    <AccordionItem
                      value="manual-search"
                      className="overflow-hidden rounded-[1.5rem] border border-white/14 bg-[#6b5a8f]/82 text-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm"
                    >
                      <AccordionTrigger className="px-4 py-4 text-white hover:no-underline [&_[data-slot=accordion-trigger-icon]]:text-white/80 sm:px-5 sm:py-5">
                        <div className="pr-4 text-left">
                          <p className="text-sm font-semibold text-white sm:text-base">
                            Manual search
                          </p>
                          <p className="mt-1 text-sm leading-6 text-white/85">
                            Search by campus, faculty, and course code.
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 sm:px-5 sm:pb-5">
                        <SearchForm onSubmit={home.handleAddSubject} isLoading={home.adding} />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-8 sm:gap-8 sm:px-6 sm:pb-12">
            {home.globalError ? (
              <div className="flex items-start gap-3 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-4 text-slate-900 shadow-sm sm:px-5">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-rose-700">
                    Something went wrong
                  </p>
                  <p className="text-sm text-slate-600">{home.globalError}</p>
                </div>
              </div>
            ) : null}

            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <SubjectsPanel
                items={home.items}
                subjectColorOverrides={home.subjectColorOverrides}
                subjectColorDrafts={home.subjectColorDrafts}
                groupKeys={home.groupKeys}
                onRemoveItem={home.removeItem}
                onSetSubjectColor={home.setSubjectColor}
                onSetSubjectColorDraft={home.setSubjectColorDraft}
                onCommitSubjectColorDraft={home.commitSubjectColorDraft}
                onChooseMatch={home.handleChooseMatch}
                onToggleShowSelectedOnly={home.toggleShowSelectedOnly}
                onClearGroups={home.clearGroups}
                onSetGroupFilter={home.setGroupFilter}
                onSelectGroup={home.selectGroup}
              />

              <HomeSidebar
                subjectCount={home.items.length}
                sessionCount={home.combinedEntries.length}
                clashCount={home.clashCount}
              />
            </div>
          </div>
        </section>

        <TimetableSection
          itemsCount={home.items.length}
          combinedEntries={home.combinedEntries}
          displayedEntries={home.displayedEntries}
          clashCount={home.clashCount}
          viewMode={home.viewMode}
          showClashesOnly={home.showClashesOnly}
          exporting={home.exporting}
          exportError={home.exportError}
          subjectColorOverrides={home.subjectColorOverrides}
          timetableRef={home.timetableRef}
          exportRef={home.exportRef}
          onSetViewMode={home.setViewMode}
          onToggleClashesOnly={() => home.setShowClashesOnly((value) => !value)}
          onExportTimetable={home.exportTimetable}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
