"use client";

import { Table } from "lucide-react";
import { useWallpaper, type LayoutStyle } from "./wallpaper-context";
import { cn } from "@/lib/utils";

interface LayoutOption {
  id: LayoutStyle;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const layoutOptions: LayoutOption[] = [
  {
    id: "wallpaper-table",
    name: "Wallpaper Table",
    description: "Classic timetable board style",
    icon: <Table className="h-4 w-4" />,
  },
];

export function LayoutSelector() {
  const { settings, updateSettings } = useWallpaper();

  return (
    <div className="grid grid-cols-1 gap-2">
      {layoutOptions.map((layout) => {
        const isSelected = settings.layoutStyle === layout.id;
        
        return (
          <button
            key={layout.id}
            type="button"
            onClick={() => updateSettings({ layoutStyle: layout.id })}
            className={cn(
              "relative p-3 rounded-lg border-2 text-left transition-all",
              "hover:border-[#21d4cf]/60 hover:bg-slate-50",
              isSelected
                ? "border-[#21d4cf] bg-[#21d4cf]/10"
                : "border-slate-200 bg-white"
            )}
          >
            <div className="flex items-start gap-2">
              <div
                className={cn(
                  "mt-0.5 transition-colors",
                  isSelected ? "text-[#0f766e]" : "text-slate-500"
                )}
              >
                {layout.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    isSelected ? "text-[#0f766e]" : "text-foreground"
                  )}
                >
                  {layout.name}
                </div>
                <div className="mt-0.5 text-xs text-slate-600">
                  {layout.description}
                </div>
              </div>
            </div>
            
            {isSelected && (
              <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#21d4cf]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
