"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  code: string;
  fullname: string;
  group?: string;
}

interface ComboboxProps {
  id?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  id,
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered =
    filter.trim() === ""
      ? options
      : options.filter(
          (o) =>
            o.code.toLowerCase().includes(filter.toLowerCase()) ||
            o.fullname.toLowerCase().includes(filter.toLowerCase())
        );

  const selected = options.find((o) => o.code === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFilter("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  function handleSelect(code: string) {
    onChange(code);
    setOpen(false);
    setFilter("");
  }

  function handleToggle() {
    if (disabled) return;
    setOpen((prev) => !prev);
    if (open) setFilter("");
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors text-left",
          "focus:outline-none focus:ring-1 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !selected && "text-muted-foreground",
          className
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          {selected ? (
            <>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {selected.code}
              </span>
              <span className="truncate">{selected.fullname}</span>
            </>
          ) : (
            <span>{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false);
                  setFilter("");
                }
              }}
              placeholder="Search…"
              autoComplete="off"
              spellCheck={false}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Options */}
          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filtered.length > 0 ? (() => {
              const rendered: React.ReactNode[] = [];
              let lastGroup: string | undefined = undefined;
              let groupIndex = 0;
              filtered.forEach((opt) => {
                if (opt.group !== lastGroup) {
                  lastGroup = opt.group;
                  rendered.push(
                    <li
                      key={`group-${opt.group ?? "default"}-${groupIndex++}`}
                      role="presentation"
                      className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none"
                    >
                      {opt.group ?? "Campuses"}
                    </li>
                  );
                }
                rendered.push(
                  <li
                    key={opt.code}
                    role="option"
                    aria-selected={opt.code === value}
                    onClick={() => handleSelect(opt.code)}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center gap-2.5 px-3 py-2 text-sm outline-none",
                      "hover:bg-accent hover:text-accent-foreground",
                      opt.code === value && "bg-accent/50"
                    )}
                  >
                    <span className="w-8 shrink-0 font-mono text-xs text-muted-foreground">
                      {opt.code}
                    </span>
                    <span className="flex-1 truncate">{opt.fullname}</span>
                    {opt.code === value && (
                      <Check className="absolute right-3 h-3.5 w-3.5 text-primary" />
                    )}
                  </li>
                );
              });
              return rendered;
            })() : (
              <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                No results for &ldquo;{filter}&rdquo;
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
