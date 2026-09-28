import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Download,
  IdCard,
  ListChecks,
  Palette,
  Plus,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { BUG_REPORT_URL, SiteFooter, SiteHeader } from "./site-chrome";

const SAMPLE_SUBJECTS = [
  { code: "CSC584", name: "Enterprise Programming", group: "CS2403A", color: "#B9A3F0" },
  { code: "ITS632", name: "Business Intelligence", group: "CS2403C", color: "#F2C572" },
  { code: "CSC577", name: "Advanced Database", group: "CS2403A", color: "#8FD4C1" },
  { code: "MAT530", name: "Discrete Mathematics", group: "CS2403B", color: "#F29C8F" },
];

const STEPS = [
  { title: "Pick groups, catch clashes", body: "Clashing groups are flagged before you commit.", icon: ListChecks, tone: "text-success" },
  { title: "Check your class canvas", body: "Week or list view. Tap any class for room and lecturer.", icon: CalendarDays, tone: "text-info" },
  { title: "Export your wallpaper", body: "Styles, custom colours or your own photo.", icon: Smartphone, tone: "text-[#FF72E1]" },
];

// Anchored on the edge facing the phone (321px wide, centred) so every card keeps the same 28px gap.
const FLOATING_CARDS = [
  { title: "Imported from MyStudent", body: "5 subjects · 9 sessions", icon: Download, tone: "bg-primary-soft text-primary-soft-foreground", position: "right-[calc(50%+188px)] top-[96px]" },
  { title: "No clashes found", body: "All groups fit your week", icon: ShieldCheck, tone: "bg-success/20 text-success", position: "left-[calc(50%+188px)] top-[208px]" },
  { title: "Night theme", body: "iPhone 15 · 1170 × 2532", icon: Palette, tone: "bg-info/20 text-info", position: "right-[calc(50%+188px)] top-[320px]" },
];

const FAQS = [
  {
    q: "Is this an official UiTM app?",
    a: "No. It's a student project that reads UiTM's public timetable portal and your MyStudent timetable. If MyStudent is down, import is down too, but manual search by course code still works because it reads the separate timetable portal.",
  },
  {
    q: "Do I need to log in or share my password?",
    a: "No. You only type your student ID. There's no account, and we never ask for your MyStudent password.",
  },
  {
    q: "Where is my timetable stored?",
    a: "In your browser. Your last import is saved on this device so you can pick up where you left off, and you can clear it from the Import step. Nothing is saved on our servers.",
  },
  {
    q: "What if a class moves or a group changes mid-semester?",
    a: "Import again (or re-add the subject with manual search), check the Subjects step and export a fresh wallpaper. It takes under a minute.",
  },
  {
    q: "Why does it say my ID wasn't found?",
    a: "Usually your timetable isn't on MyStudent yet, which is common before registration closes, or there's a typo in the ID. Check the digits, or add your subjects by course code with manual search.",
  },
  {
    q: "Will the wallpaper fit my phone?",
    a: "Exports are 1170 × 2532, sized for iPhone 15 Pro in portrait. On other phones, pinch to fit when you set it as your wallpaper.",
  },
];

function StepNumber({ n }: { n: number }) {
  return (
    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-xs font-semibold text-primary-soft-foreground">
      {n}
    </span>
  );
}

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute -top-[120px] left-[calc(50%+40px)] size-[720px] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_40%,transparent),transparent)]" />
      <div aria-hidden="true" className="pointer-events-none absolute top-[300px] left-[calc(50%-920px)] size-[700px] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--info)_22%,transparent),transparent)]" />

      <SiteHeader />

      <main className="relative z-10">
        <section className="flex flex-col items-center px-4 pt-16 text-center md:pt-20">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary-soft-foreground">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            New · Import straight from MyStudent
          </p>
          <h1 className="mt-7 text-[clamp(2.75rem,8vw,4.5rem)] leading-[1.05] font-bold tracking-[-0.035em]">
            Your classes.
            <br />
            <span className="bg-linear-to-r from-[#FF72E1] via-[#9353D3] to-[#338EF7] bg-clip-text text-transparent">Your lock screen.</span>
          </h1>
          <p className="mt-6 max-w-[560px] text-lg leading-[1.5] text-muted-foreground">
            Turn your UiTM timetable into a wallpaper in under a minute.
            <br className="hidden sm:block" /> Import, pick groups, export.
          </p>

          <form id="start" action="/app" method="get" className="mt-9 flex w-full max-w-[527px] flex-col gap-2 rounded-[20px] border border-border bg-card p-1.5 text-left shadow-[0_8px_30px_color-mix(in_oklab,var(--primary)_12%,transparent)] sm:flex-row">
            <label className="flex min-w-0 flex-1 flex-col justify-center rounded-xl bg-muted px-3 py-2 focus-within:ring-2 focus-within:ring-primary">
              <span className="text-xs text-muted-foreground">Student ID</span>
              <span className="flex items-center gap-2">
                <IdCard aria-hidden="true" className="size-4 shrink-0 text-faint" />
                <input
                  name="id"
                  required
                  inputMode="numeric"
                  pattern="\d+"
                  autoComplete="off"
                  placeholder="e.g. 2023456789"
                  className="w-full min-w-0 bg-transparent text-base text-foreground outline-none placeholder:text-faint"
                />
              </span>
            </label>
            <button type="submit" className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              <ArrowRight aria-hidden="true" className="size-4" />
              Load my timetable
            </button>
          </form>
          <p className="mt-5 text-xs text-faint">
            No account needed ·{" "}
            <Link href="/app?tab=search" className="underline-offset-2 hover:text-foreground hover:underline">
              Or search by course code
            </Link>
          </p>

          <div className="relative mt-14 h-[420px] w-full max-w-[1312px] overflow-hidden sm:h-[520px]">
            <Image
              src="/hero-phone.webp"
              alt="Phone lock screen showing a colourful five-day UiTM class timetable"
              width={642}
              height={1273}
              priority
              className="absolute top-[30px] left-1/2 w-[260px] -translate-x-1/2 sm:w-[321px]"
            />
            {FLOATING_CARDS.map(({ title, body, icon: Icon, tone, position }) => (
              <div key={title} aria-hidden="true" className={`absolute hidden items-center gap-3 rounded-2xl border border-border bg-card/80 p-4 text-left shadow-[0_12px_32px_#00000033] backdrop-blur-lg lg:flex ${position}`}>
                <span className={`flex size-9 items-center justify-center rounded-[10px] ${tone}`}>
                  <Icon className="size-[18px]" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="block text-xs text-muted-foreground">{body}</span>
                </span>
              </div>
            ))}
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[140px] bg-linear-to-b from-transparent to-background" />
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-[1440px] scroll-mt-8 px-4 py-16 md:px-16">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-primary-soft-foreground uppercase">How it works</p>
              <h2 className="mt-2 text-[clamp(2rem,4vw,2.5rem)] font-bold tracking-[-0.025em]">Four steps. One wallpaper.</h2>
            </div>
            <p className="text-sm text-muted-foreground">Everything stays on your device.</p>
          </div>

          <div className="mt-9 grid gap-4 lg:grid-cols-2">
            <article className="relative overflow-hidden rounded-[20px] border border-border bg-card p-6 lg:row-span-3">
              <StepNumber n={1} />
              <h3 className="mt-4 text-xl font-semibold">Import with your student ID</h3>
              <p className="mt-2 max-w-[540px] text-sm leading-[1.5] text-muted-foreground">
                We read your registered classes from MyStudent. Prefer to do it by hand? Search by campus, faculty and course code.
              </p>
              <ul className="mt-5 space-y-2" aria-label="Sample imported subjects">
                {SAMPLE_SUBJECTS.map((subject) => (
                  <li key={subject.code} className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5 text-sm">
                    <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: subject.color }} />
                    <span className="font-semibold">{subject.code}</span>
                    <span className="truncate text-muted-foreground">{subject.name}</span>
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary-soft-foreground">
                      <span aria-hidden="true" className="size-1 rounded-full bg-current" />
                      {subject.group}
                    </span>
                  </li>
                ))}
              </ul>
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-card" />
            </article>
            {STEPS.map(({ title, body, icon: Icon, tone }, index) => (
              <article key={title} className="flex items-start gap-4 rounded-[20px] border border-border bg-card p-6 lg:min-h-[120px]">
                <StepNumber n={index + 2} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-[17px] font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                </div>
                <Icon aria-hidden="true" className={`size-5 shrink-0 ${tone}`} />
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto flex max-w-[1440px] scroll-mt-8 flex-col gap-10 px-4 pt-8 pb-24 md:px-16 lg:flex-row lg:gap-24">
          <div className="flex flex-col gap-4 lg:w-[440px] lg:shrink-0">
            <p className="text-xs font-semibold tracking-[0.12em] text-primary-soft-foreground uppercase">FAQ</p>
            <h2 className="text-[clamp(2rem,4vw,2.5rem)] font-bold tracking-[-0.025em]">Questions, answered.</h2>
            <p className="text-[15px] leading-[1.6] text-muted-foreground">
              The short version: no account, nothing stored on our servers, and this isn&apos;t official UiTM software.
            </p>
            <a href={BUG_REPORT_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 pt-2 text-sm font-semibold hover:underline">
              Still stuck? Report a bug
              <ArrowRight aria-hidden="true" className="size-4 text-primary-soft-foreground" />
            </a>
          </div>
          <div className="flex-1 border-t border-border">
            {FAQS.map(({ q, a }, index) => (
              <details key={q} open={index === 0} className="group border-b border-border py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg text-lg font-semibold focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-open:bg-primary-soft group-open:text-primary-soft-foreground">
                    <Plus aria-hidden="true" className="size-4 transition-transform group-open:rotate-45" />
                  </span>
                </summary>
                <p className="mt-3 max-w-[640px] text-[15px] leading-[1.6] text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 pt-8 pb-20 md:px-16">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-linear-to-r from-[#9353D3] to-[#006FEE] p-8 text-white sm:flex-row sm:items-center sm:p-12">
            <div>
              <h2 className="text-[clamp(1.75rem,3vw,2rem)] font-bold tracking-[-0.02em]">Ready before your first class.</h2>
              <p className="mt-1 text-white/80">Free, unofficial, built by students.</p>
            </div>
            <a href="#start" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#11181C] transition-opacity hover:opacity-90">
              <ArrowRight aria-hidden="true" className="size-4" />
              Start with my student ID
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
