"use client";

import { useWallpaper, type ThemeId } from "./wallpaper-context";
import { cn } from "@/lib/utils";

interface ThemeOption {
  id: ThemeId;
  name: string;
  preview: string; // gradient or color for preview
}

const themeOptions: ThemeOption[] = [
  {
    id: "ios-default",
    name: "iOS Default",
    preview: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "dark",
    name: "Dark Mode",
    preview: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
  },
  {
    id: "light",
    name: "Light & Clean",
    preview: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  },
  {
    id: "gradient",
    name: "Gradient Aurora",
    preview: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: "solid",
    name: "Solid Colors",
    preview: "linear-gradient(135deg, #4f46e5 0%, #4f46e5 100%)",
  },
  {
    id: "glass",
    name: "Glassmorphism",
    preview: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)",
  },
];

export function ThemeSelector() {
  const { settings, updateSettings } = useWallpaper();

  return (
    <div className="grid grid-cols-3 gap-2">
      {themeOptions.map((theme) => {
        const isSelected = settings.themeId === theme.id;
        
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => updateSettings({ themeId: theme.id })}
            className={cn(
              "relative rounded-lg border-2 transition-all overflow-hidden",
              "hover:border-primary/50",
              isSelected ? "border-primary" : "border-border"
            )}
          >
            {/* Preview */}
            <div
              className="h-16 w-full"
              style={{ background: theme.preview }}
            />
            
            {/* Label */}
            <div className="px-2 py-1.5 bg-background">
              <div
                className={cn(
                  "text-xs font-medium text-center transition-colors truncate",
                  isSelected ? "text-primary" : "text-foreground"
                )}
              >
                {theme.name}
              </div>
            </div>
            
            {isSelected && (
              <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-white shadow-lg" />
            )}
          </button>
        );
      })}
    </div>
  );
}
