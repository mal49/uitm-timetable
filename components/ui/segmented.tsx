import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SegmentedProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
  label: string;
  className?: string;
  itemClassName?: string;
};

/** HeroUI-style segmented control: muted track, raised active item. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
  itemClassName,
}: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn("flex rounded-xl bg-muted p-1", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:bg-surface-3 aria-pressed:text-foreground aria-pressed:shadow-sm [&_svg]:size-4",
            itemClassName,
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
