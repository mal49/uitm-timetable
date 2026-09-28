"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Brand, ThemeToggle } from "@/components/brand";
import { STEPS, type Step } from "@/app/_home/use-home-page";
import { cn } from "@/lib/utils";

type AppNavbarProps = {
  step: Step;
  maxStep: Step;
  onStepChange: (step: Step) => void;
};

export function AppNavbar({ step, maxStep, onStepChange }: AppNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
        <Brand className="[&>span]:hidden sm:[&>span]:inline" />
        <nav aria-label="Steps">
          <ol className="flex items-center gap-1 sm:gap-2">
            {STEPS.map((label, index) => {
              const done = index < step;
              const current = index === step;
              return (
                <li key={label} className="flex items-center gap-1 sm:gap-2">
                  {index > 0 ? <span aria-hidden="true" className="hidden h-0.5 w-8 rounded-full bg-surface-3 md:block" /> : null}
                  <button
                    type="button"
                    disabled={index > maxStep}
                    aria-current={current ? "step" : undefined}
                    onClick={() => onStepChange(index as Step)}
                    className={cn(
                      "flex h-9 items-center gap-2.5 rounded-full px-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed md:pr-3",
                      current ? "bg-primary-soft text-primary-soft-foreground" : "text-foreground hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full text-xs",
                        done || current ? "bg-primary text-primary-foreground" : "bg-surface-3 text-muted-foreground",
                      )}
                    >
                      {done ? <Check aria-hidden="true" className="size-3.5" /> : index + 1}
                    </span>
                    <span className={cn("hidden md:inline", current && "inline")}>{label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-[13px] text-faint xl:inline">Unofficial tool</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

type SummaryBarProps = {
  subjects: number;
  sessions: number;
  clashes: number;
  back: { label: string; onClick?: () => void };
  next: ReactNode;
};

export function SummaryBar({ subjects, sessions, clashes, back, next }: SummaryBarProps) {
  const stats = [
    [subjects, "subjects"],
    [sessions, "sessions"],
    [clashes, "clashes"],
  ] as const;
  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card">
      <div className="flex h-[68px] items-center justify-end gap-3 px-4 sm:justify-between lg:px-8">
        <dl className="hidden items-center gap-7 sm:flex">
          {stats.map(([value, label]) => (
            <div key={label} className="flex items-baseline gap-2">
              <dt className="sr-only">{label}</dt>
              <dd className={cn("text-lg font-bold", label === "clashes" && value > 0 && "text-destructive")}>{value}</dd>
              <span aria-hidden="true" className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </dl>
        <div className="flex items-center gap-2">
          {back.onClick ? (
            <button type="button" onClick={back.onClick} className={secondaryButton}>{back.label}</button>
          ) : (
            <Link href="/" className={secondaryButton}>{back.label}</Link>
          )}
          {next}
        </div>
      </div>
    </footer>
  );
}

const secondaryButton =
  "inline-flex h-10 items-center rounded-xl bg-muted px-4 text-sm font-medium whitespace-nowrap text-foreground transition-colors hover:bg-surface-3";

export const primaryButton =
  "inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium whitespace-nowrap text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4";

export function NextButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={primaryButton}>
      <ArrowRight aria-hidden="true" />
      {label}
    </button>
  );
}
