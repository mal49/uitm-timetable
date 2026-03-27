import { ExternalLink, GraduationCap } from "lucide-react";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-background/20">
      <div className="mx-auto max-w-6xl px-3 py-8 sm:px-4 sm:py-10 md:px-6">
        <div className="grid gap-8 border-b border-border/60 pb-6 md:grid-cols-[minmax(0,1fr)_280px] md:gap-12">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4.5 w-4.5 text-primary" />
              <p className="text-base font-semibold tracking-tight text-foreground">UiTM Timetable Maker</p>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Plan your semester, compare groups, and export a timetable without fighting the official portal.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">Source</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Timetable data is referenced from the official UiTM scheduling portal.
            </p>
            <a
              href="https://simsweb4.uitm.edu.my"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              simsweb4.uitm.edu.my
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>Unofficial UiTM timetable helper for students planning semester schedules.</p>
          <p>© {year} UiTM Timetable Maker</p>
        </div>
      </div>
    </footer>
  );
}
