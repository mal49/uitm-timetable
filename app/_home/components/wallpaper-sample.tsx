import { WallpaperProvider } from "@/components/wallpaper-maker-v2/wallpaper-context";
import { WallpaperTable } from "@/components/wallpaper-maker-v2/layouts/wallpaper-table";
import { getThemePreset } from "@/components/wallpaper-maker-v2/themes/theme-presets";
import type { ThemeId } from "@/components/wallpaper-maker-v2/wallpaper-context";
import type { TimetableEntry } from "@/lib/types";

const entries: TimetableEntry[] = [
  { section: "CS2484A", day: "Monday", start: "08:00", end: "10:00", course: "CSC669", venue: "MKM 2" },
  { section: "CS2484A", day: "Monday", start: "13:00", end: "15:00", course: "MAT421", venue: "BK 14" },
  { section: "CS2484A", day: "Tuesday", start: "10:00", end: "12:00", course: "STA416", venue: "BK 08" },
  { section: "CS2484A", day: "Tuesday", start: "14:00", end: "16:00", course: "ELC501", venue: "APB 3" },
  { section: "CS2484A", day: "Wednesday", start: "08:00", end: "10:00", course: "MAT421", venue: "BK 14" },
  { section: "CS2484A", day: "Wednesday", start: "11:00", end: "13:00", course: "CSC669", venue: "MKM 2" },
  { section: "CS2484A", day: "Thursday", start: "09:00", end: "11:00", course: "ELC501", venue: "APB 3" },
  { section: "CS2484A", day: "Thursday", start: "13:00", end: "15:00", course: "STA416", venue: "BK 08" },
];
const colors = { CSC669: "#188c72", MAT421: "#8860c1", STA416: "#c07839", ELC501: "#438fc1" };

export function WallpaperSample({ themeId = "light", customBackground }: { themeId?: ThemeId; customBackground?: string }) {
  const theme = getThemePreset(themeId, customBackground);
  return (
    <div role="img" aria-label="Sample lock screen wallpaper with a colourful four-day UiTM class timetable" className="relative h-[536px] w-[260px] shrink-0 overflow-hidden rounded-[42px] border-[6px] border-[#242129] bg-[#242129] shadow-[0_24px_55px_-18px_rgba(0,0,0,0.4)]">
      <div aria-hidden="true" className="h-full overflow-hidden rounded-[35px] pt-12" style={{ background: theme.background, color: theme.lockscreenTextColor }}>
        <div className="absolute left-1/2 top-3 h-5 w-20 -translate-x-1/2 rounded-full bg-[#17151b]" />
        <p className="text-center text-xs font-medium">Monday, 14 September</p>
        <p className="mt-1 text-center text-[68px] font-medium leading-none tracking-[-0.06em]">9:41</p>
        <div className="mt-8 h-[290px]">
          <WallpaperProvider initialEntries={entries} initialColorOverrides={colors} initialSettings={{ themeId, customBackground, titleText: "My semester", showVenue: true, showTime: false }}>
            <WallpaperTable entries={entries} colorOverrides={colors} renderMode="export" />
          </WallpaperProvider>
        </div>
        <div className="absolute bottom-3 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-current opacity-60" />
      </div>
    </div>
  );
}
