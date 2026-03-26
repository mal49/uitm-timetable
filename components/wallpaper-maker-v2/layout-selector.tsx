"use client";

import { List, Clock, LayoutGrid, Calendar, FileText, Table } from "lucide-react";
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
    id: "compact-list",
    name: "Compact List",
    description: "Minimalist vertical list",
    icon: <List className="h-4 w-4" />,
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Visual timeline with blocks",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: "day-cards",
    name: "Day Cards",
    description: "Day-by-day card layout",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    id: "mini-grid",
    name: "Mini Grid",
    description: "Compact matrix view",
    icon: <LayoutGrid className="h-4 w-4" />,
  },
  {
    id: "agenda",
    name: "Agenda",
    description: "Text-focused calendar style",
    icon: <FileText className="h-4 w-4" />,
  },
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
    <div className="grid grid-cols-2 gap-2">
      {layoutOptions.map((layout) => {
        const isSelected = settings.layoutStyle === layout.id;
        
        return (
          <button
            key={layout.id}
            type="button"
            onClick={() => updateSettings({ layoutStyle: layout.id })}
            className={cn(
              "relative p-3 rounded-lg border-2 text-left transition-all",
              "hover:border-primary/50 hover:bg-muted/50",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border bg-background"
            )}
          >
            <div className="flex items-start gap-2">
              <div
                className={cn(
                  "mt-0.5 transition-colors",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}
              >
                {layout.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {layout.name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {layout.description}
                </div>
              </div>
            </div>
            
            {isSelected && (
              <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
