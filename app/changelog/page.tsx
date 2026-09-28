import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/app/_landing/site-chrome";

export const metadata: Metadata = {
  title: "Changelog · UiTM Schedule",
  description: "Every fix and feature in UiTM Schedule, newest first.",
};

type Kind = "New" | "Improved" | "Fixed";

const KIND_STYLE: Record<Kind, string> = {
  New: "bg-[#17C964]/15 text-[#12A150] dark:text-[#17C964]",
  Improved: "bg-[#338EF7]/15 text-[#006FEE] dark:text-[#338EF7]",
  Fixed: "bg-[#F5A524]/15 text-[#C4841D] dark:text-[#F5A524]",
};

const RELEASES: { version: string; date: string; title: string; items: [Kind, string][] }[] = [
  {
    version: "v1.4",
    date: "Sep 2026",
    title: "Your own photo, behind your classes",
    items: [
      ["New", "Photo backgrounds. Pick any image, then Glass, Scrim, Tint or Split keeps your classes readable on top."],
      ["New", "Eleven wallpaper styles, from Paper Agenda and Dot Matrix to five UiTM Heritage editions."],
      ["Improved", "A redesigned four-step builder: Import, Subjects, Canvas, Wallpaper."],
      ["Improved", "Wallpapers now focus on iPhone in portrait (1170 × 2532). Landscape and iPad sizes have been removed."],
    ],
  },
  {
    version: "v1.3",
    date: "4 Apr 2026",
    title: "Sharper exports",
    items: [
      ["New", "Landscape wallpapers for iPhone and iPad."],
      ["Improved", "Exported wallpapers size text to fit each class block, so long course codes and rooms stay legible."],
    ],
  },
  {
    version: "v1.2",
    date: "3 Apr 2026",
    title: "Import from MyStudent",
    items: [["New", "Load your registered classes with your student ID instead of adding subjects one by one."]],
  },
  {
    version: "v1.1",
    date: "30 Mar 2026",
    title: "Custom colours",
    items: [
      ["New", "Pick any wallpaper background with the colour picker and swatches."],
      ["Fixed", "The download button didn't respond on some phones."],
      ["Fixed", "Shah Alam course codes that need a faculty now search correctly."],
    ],
  },
  {
    version: "v1.0",
    date: "25 Mar 2026",
    title: "First release",
    items: [["New", "Search by course code, pick groups, catch clashes and export a lock-screen wallpaper. That's it."]],
  },
];

export default function ChangelogPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute -top-[120px] left-[calc(50%+40px)] size-[720px] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_40%,transparent),transparent)]" />

      <SiteHeader active="Changelog" />

      <main className="relative z-10 mx-auto max-w-[1440px] px-4 md:px-16">
        <div className="flex flex-col gap-4 pt-16 pb-12 md:pt-24 md:pb-16">
          <p className="text-xs font-semibold tracking-[0.12em] text-primary-soft-foreground uppercase">Changelog</p>
          <h1 className="text-[clamp(2.75rem,7vw,4rem)] leading-[1.2] font-bold tracking-[-0.03em]">What&apos;s new.</h1>
          <p className="max-w-[560px] text-[17px] leading-[1.6] text-muted-foreground">
            Every fix and feature, newest first. Most of them started as a bug report from someone in class.
          </p>
        </div>

        <ol className="pb-24">
          {RELEASES.map(({ version, date, title, items }, index) => (
            <li key={version} className="flex flex-col gap-5 border-t border-border py-10 md:flex-row md:gap-16">
              <div className="flex shrink-0 flex-col gap-2 md:w-60">
                <p className="flex items-center gap-2.5">
                  <span className="font-mono text-xl font-bold">{version}</span>
                  {index === 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary-soft-foreground">
                      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                      Latest
                    </span>
                  ) : null}
                </p>
                <time className="text-sm text-faint">{date}</time>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-5">
                <h2 className="text-2xl font-semibold tracking-[-0.02em]">{title}</h2>
                <ul className="flex flex-col gap-3.5">
                  {items.map(([kind, text]) => (
                    <li key={text} className="flex flex-col gap-1.5 sm:flex-row sm:gap-4">
                      <span className="w-[84px] shrink-0">
                        <span className={`inline-block rounded-md px-2 py-[3px] text-xs font-semibold ${KIND_STYLE[kind]}`}>{kind}</span>
                      </span>
                      <span className="text-[15px] leading-[1.6] text-muted-foreground">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </main>

      <SiteFooter />
    </div>
  );
}
