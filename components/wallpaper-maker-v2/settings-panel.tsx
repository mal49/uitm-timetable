"use client";

import { Palette, Type, Eye, Wand2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LayoutSelector } from "./layout-selector";
import { ThemeSelector } from "./theme-selector";
import { TypographyControls } from "./typography-controls";
import { VisibilityControls } from "./visibility-controls";

export function SettingsPanel() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-5 py-4 border-b border-border">
        <h2 className="text-lg font-bold text-slate-900">Wallpaper Designer</h2>
        <p className="mt-0.5 text-xs text-slate-600">
          Customize your timetable wallpaper
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
        {/* Layout Style */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Wand2 className="h-4 w-4 text-slate-600" />
            Layout Style
          </h3>
          <LayoutSelector />
        </div>

        {/* Theme */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Palette className="h-4 w-4 text-slate-600" />
            Theme
          </h3>
          <ThemeSelector />
        </div>

        {/* Collapsible Customization Options */}
        <Accordion multiple className="w-full">
          {/* Typography */}
          <AccordionItem value="typography">
            <AccordionTrigger className="text-sm font-semibold text-slate-900 hover:no-underline">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-slate-600" />
                Typography
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <TypographyControls />
            </AccordionContent>
          </AccordionItem>

          {/* Visibility */}
          <AccordionItem value="visibility">
            <AccordionTrigger className="text-sm font-semibold text-slate-900 hover:no-underline">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-slate-600" />
                Element Visibility
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <VisibilityControls />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
