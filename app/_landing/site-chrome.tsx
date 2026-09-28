import Link from "next/link";
import { ArrowUpRight, Database, ExternalLink, Info, Lock } from "lucide-react";
import { Brand, ThemeToggle } from "@/components/brand";

const REPO_URL = "https://github.com/mal49/uitm-timetable";
export const BUG_REPORT_URL = `${REPO_URL}/issues/new`;

const NAV_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
  { label: "Changelog", href: "/changelog" },
];

export function SiteHeader({ active }: { active?: "Changelog" }) {
  return (
    <header className="relative z-10 mx-auto max-w-[1440px] px-4 py-4 md:px-16">
      <nav aria-label="Main" className="flex items-center justify-between gap-3 rounded-full border border-border bg-card/70 py-2 pr-2 pl-5 shadow-[0_8px_24px_color-mix(in_oklab,var(--primary)_15%,transparent),0_1px_3px_#0000001a] backdrop-blur-md">
        <Brand />
        <div className="hidden items-center gap-0.5 rounded-full bg-muted p-1 md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              aria-current={active === label ? "page" : undefined}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-surface-3 aria-[current=page]:font-semibold aria-[current=page]:text-foreground aria-[current=page]:shadow-[0_1px_3px_#00000066]"
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/app" className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold whitespace-nowrap text-primary-foreground transition-opacity hover:opacity-90">
            <ArrowUpRight aria-hidden="true" className="size-4" />
            Open app
          </Link>
        </div>
      </nav>
    </header>
  );
}

// Same glyphs as the Pencil footer: Lucide's instagram/github/linkedin (inlined, since
// lucide-react 1.x dropped brand icons) plus the Threads logo path.
// TODO: replace the "#" hrefs with the real profile links.
const LUCIDE_STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const SOCIALS = [
  {
    label: "Instagram",
    href: "#",
    size: "size-[18px]",
    icon: (
      <g {...LUCIDE_STROKE}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </g>
    ),
  },
  {
    label: "Threads",
    href: "#",
    size: "size-[17px]",
    icon: (
      <path fill="currentColor" d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509-1.645-2.051-2.495-4.905-2.523-8.481v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717-1.338 1.668-2.029 4.078-2.056 7.164.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32l-1.757-1.18c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z" />
    ),
  },
  {
    label: "GitHub",
    href: REPO_URL,
    size: "size-[18px]",
    icon: (
      <g {...LUCIDE_STROKE}>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </g>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    size: "size-[18px]",
    icon: (
      <g {...LUCIDE_STROKE}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </g>
    ),
  },
];

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "FAQ", href: "/#faq" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "UiTM resources",
    links: [
      { label: "MyStudent", href: "https://mystudent.uitm.edu.my" },
      { label: "Timetable portal", href: "https://simsweb4.uitm.edu.my/estudent/class_timetable/" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "Report a bug", href: BUG_REPORT_URL },
      { label: "Request a feature", href: BUG_REPORT_URL },
      { label: "Source code", href: REPO_URL },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border bg-card">
      <div className="mx-auto max-w-[1440px] px-4 pt-16 pb-8 md:px-16">
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="flex max-w-[360px] flex-col gap-4">
            <Brand className="text-lg" />
            <p className="text-sm leading-[1.6] text-muted-foreground">
              Turn your UiTM timetable into a lock-screen wallpaper. Import, pick groups, export — in under a minute.
            </p>
            <div className="flex items-center gap-2.5">
              {SOCIALS.map(({ label, href, size, icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-full border border-border bg-muted text-foreground transition-colors hover:bg-surface-3"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className={size}>
                    {icon}
                  </svg>
                </a>
              ))}
            </div>
            <p className="flex gap-2.5 rounded-xl bg-muted px-3 py-2.5 text-xs leading-[1.5] text-muted-foreground">
              <Info aria-hidden="true" className="mt-px size-4 shrink-0" />
              Unofficial student project. Not affiliated with or endorsed by Universiti Teknologi MARA.
            </p>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_COLUMNS.map(({ title, links }) => (
              <div key={title} className="flex flex-col gap-3">
                <p className="text-xs font-semibold tracking-[0.08em] text-faint uppercase">{title}</p>
                {links.map(({ label, href }) =>
                  href.startsWith("http") ? (
                    <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                      {label}
                      <ExternalLink aria-hidden="true" className="size-[13px] text-faint" />
                    </a>
                  ) : (
                    <Link key={label} href={href} className="text-sm text-muted-foreground hover:text-foreground">
                      {label}
                    </Link>
                  ),
                )}
              </div>
            ))}
            <div className="col-span-2 flex flex-col items-start gap-3 sm:col-span-1">
              <p className="text-xs font-semibold tracking-[0.08em] text-faint uppercase">Get started</p>
              <p className="text-sm leading-[1.5] text-muted-foreground">Your wallpaper is one student ID away.</p>
              <Link href="/app" className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                <ArrowUpRight aria-hidden="true" className="size-4" />
                Open app
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-5 text-[13px] text-faint md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} UiTM Schedule · Made by students, for students</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-5">
            <p className="flex items-center gap-1.5">
              <Database aria-hidden="true" className="size-3.5" />
              Data: simsweb4.uitm.edu.my · MyStudent
            </p>
            <p className="flex items-center gap-1.5">
              <Lock aria-hidden="true" className="size-3.5" />
              No account · nothing stored on our servers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
