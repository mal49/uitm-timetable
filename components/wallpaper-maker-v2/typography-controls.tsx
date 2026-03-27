"use client";

import { useWallpaper } from "./wallpaper-context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TypographyControls() {
  const { settings, updateSettings } = useWallpaper();

  return (
    <div className="space-y-4 pt-2 pb-1">
      {/* Title Text */}
      <div className="space-y-2">
        <Label htmlFor="title-text" className="text-xs">Title Text</Label>
        <Input
          id="title-text"
          value={settings.titleText}
          onChange={(e) => updateSettings({ titleText: e.target.value })}
          placeholder="My Timetable"
          className="h-8 text-xs"
        />
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="font-size" className="text-xs">Font Size</Label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.fontSize * 100)}%</span>
        </div>
        <input
          id="font-size"
          type="range"
          min="0.8"
          max="1.4"
          step="0.1"
          value={settings.fontSize}
          onChange={(e) => updateSettings({ fontSize: parseFloat(e.target.value) })}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      {/* Font Weight */}
      <div className="space-y-2">
        <Label htmlFor="font-weight" className="text-xs">Font Weight</Label>
        <Select
          value={settings.fontWeight}
          onValueChange={(value) => {
            if (!value) return;
            updateSettings({ fontWeight: value });
          }}
        >
          <SelectTrigger id="font-weight" className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="bold">Bold</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
