"use client";

import { Palette, Type, Maximize2, Eye, Wand2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LayoutSelector } from "./layout-selector";
import { ThemeSelector } from "./theme-selector";
import { ColorControls } from "./color-controls";
import { TypographyControls } from "./typography-controls";
import { DensityControls } from "./density-controls";
import { VisibilityControls } from "./visibility-controls";

export function SettingsPanel() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-5 py-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">Wallpaper Designer</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Customize your timetable wallpaper
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
        {/* Layout Style */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Layout Style
          </h3>
          <LayoutSelector />
        </div>

        {/* Theme */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </h3>
          <ThemeSelector />
        </div>

        {/* Collapsible Customization Options */}
        <Accordion type="multiple" className="w-full">
          {/* Colors */}
          <AccordionItem value="colors">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Colors
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ColorControls />
            </AccordionContent>
          </AccordionItem>

          {/* Typography */}
          <AccordionItem value="typography">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Typography
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <TypographyControls />
            </AccordionContent>
          </AccordionItem>

          {/* Density */}
          <AccordionItem value="density">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Maximize2 className="h-4 w-4" />
                Density & Spacing
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <DensityControls />
            </AccordionContent>
          </AccordionItem>

          {/* Visibility */}
          <AccordionItem value="visibility">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
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
