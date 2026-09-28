"use client";

import { Download } from "lucide-react";
import { AppNavbar, NextButton, primaryButton, SummaryBar } from "@/app/_home/components/app-chrome";
import { ImportStep } from "@/app/_home/components/import-step";
import { SubjectsStep } from "@/app/_home/components/subjects-panel";
import { CanvasStep } from "@/app/_home/components/timetable-section";
import { STEPS, useHomePage, type Step } from "@/app/_home/use-home-page";
import { WallpaperMaker } from "@/components/wallpaper-maker-v2/wallpaper-maker";

export function HomePage({ initialStudentId, initialTab }: { initialStudentId?: string; initialTab: "id" | "search" }) {
  const home = useHomePage();
  const { step, setStep } = home;
  const hasEntries = home.combinedEntries.length > 0;
  // Canvas and wallpaper need at least one session to show anything.
  const maxStep: Step = hasEntries ? 3 : home.items.length > 0 ? 1 : 0;

  return (
    <div className="min-h-screen bg-background pb-[68px] text-foreground">
      <AppNavbar step={step} maxStep={Math.max(maxStep, step) as Step} onStepChange={setStep} />
      <main>
        {step === 0 ? <ImportStep home={home} initialStudentId={initialStudentId} initialTab={initialTab} /> : null}
        {step === 1 ? <SubjectsStep home={home} /> : null}
        {step === 2 ? <CanvasStep home={home} /> : null}
        {step === 3 ? <WallpaperMaker entries={home.combinedEntries} colorOverrides={home.subjectColors} /> : null}
      </main>
      <SummaryBar
        subjects={home.items.length}
        sessions={home.combinedEntries.length}
        clashes={home.clashPairs.length}
        back={step === 0 ? { label: "Back" } : { label: `Back: ${STEPS[step - 1]}`, onClick: () => setStep((step - 1) as Step) }}
        next={
          step === 3 ? (
            <button type="submit" form="wallpaper-export" className={primaryButton}>
              <Download aria-hidden="true" />
              Export wallpaper
            </button>
          ) : (
            <NextButton label={`Next: ${STEPS[step + 1]}`} disabled={step + 1 > maxStep} onClick={() => setStep((step + 1) as Step)} />
          )
        }
      />
    </div>
  );
}
