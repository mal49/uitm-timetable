import { ExternalLink, GraduationCap } from "lucide-react";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#101728] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="h-3.5 w-3.5 text-[#7df4c3]" />
                <p className="text-sm font-semibold tracking-tight text-white">
                  UiTM Timetable Maker
                </p>
              </div>
              <p className="max-w-xl text-sm leading-6 text-white/65">
                Plan your semester, compare groups, and export a timetable without fighting the official portal.
              </p>
            </div>

            <div className="min-w-0 space-y-1 sm:max-w-[280px] sm:text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
                Source
              </p>
              <p className="text-xs leading-5 text-white/60 sm:text-sm">
                Timetable data is referenced from the UiTM scheduling portal.
              </p>
              <a
                href="https://simsweb4.uitm.edu.my"
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-white transition-colors hover:text-[#7df4c3] sm:justify-end"
              >
                <span className="truncate">simsweb4.uitm.edu.my</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-white/10 pt-3 text-[11px] leading-5 text-white/45 sm:flex-row sm:items-center sm:justify-between sm:text-xs">
            <p className="max-w-2xl">
              Unofficial UiTM timetable helper for students planning semester schedules.
            </p>
            <p className="shrink-0">© {year} UiTM Timetable Maker</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
