"use client";

import { useMemo } from "react";
import type { TimetableEntry } from "@/lib/types";
import { useWallpaper } from "../wallpaper-context";
import { getThemePreset } from "../themes/theme-presets";

export interface WallpaperTableProps {
  entries: TimetableEntry[];
  colorOverrides: Record<string, string>;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const MIN_VISIBLE_HOUR = 7;
const MAX_VISIBLE_HOUR = 22;
const MIN_HOUR_SPAN = 8;

function getDayIndex(day: string): number {
  const value = day.trim().toLowerCase();
  if (value.startsWith("mon")) return 0;
  if (value.startsWith("tue")) return 1;
  if (value.startsWith("wed")) return 2;
  if (value.startsWith("thu")) return 3;
  if (value.startsWith("fri")) return 4;
  return -1;
}

function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return (hour ?? 0) * 60 + (minute ?? 0);
}

function formatMinimalHourLabel(hour24: number): string {
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return hour12.toString().padStart(2, "0");
}

function toSoftTint(hexColor: string, alpha = 0.18): string {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
  if (!match) return "rgba(224, 214, 200, 0.7)";
  const [, r, g, b] = match;
  return `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${alpha})`;
}

function parseRgbChannels(value: string): [number, number, number] | null {
  const hexMatch = value.trim().match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    const [, r, g, b] = hexMatch;
    return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
  }

  const rgbMatch = value.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
  }

  return null;
}

function getPerceivedBrightness(value: string): number {
  const channels = parseRgbChannels(value);
  if (!channels) return 255;
  const [r, g, b] = channels;
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function formatVenueLabel(venue: string): string {
  const trimmed = venue.trim();
  if (!trimmed) return "";

  if (/online/i.test(trimmed)) return "Online";
  if (/virtual\s*lab/i.test(trimmed)) return "Virtual Lab";

  const labCodeMatch = trimmed.match(/\b(MK|DK|BK|SK|BILIK)\s*-?\s*(\d+[A-Z]?)\b/i);
  if (labCodeMatch) {
    const [, prefix, number] = labCodeMatch;
    return `${prefix.toUpperCase()}${number.toUpperCase()}`;
  }

  const multimediaMatch = trimmed.match(/\bmultimedia\b/i);
  if (multimediaMatch) return "Multimedia";

  const tokens = trimmed
    .replace(/[(),]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 1) {
    return tokens[0].length > 12 ? `${tokens[0].slice(0, 12)}...` : tokens[0];
  }

  const compact = tokens.slice(0, 2).join(" ");
  return compact.length > 16 ? `${compact.slice(0, 16)}...` : compact;
}

type TableBlock = {
  id: string;
  dayIndex: number;
  top: number;
  height: number;
  durationMinutes: number;
  courseCode: string;
  subjectName: string;
  venue: string;
  lecturer: string;
  start: string;
  end: string;
  borderColor: string;
  startMinutes: number;
  endMinutes: number;
  columnIndex: number;
  columnCount: number;
};

function assignOverlapColumns(blocks: TableBlock[]): TableBlock[] {
  const resolvedBlocks: TableBlock[] = [];

  for (const dayIndex of [0, 1, 2, 3, 4]) {
    const dayBlocks = blocks
      .filter((block) => block.dayIndex === dayIndex)
      .sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);

    let cluster: TableBlock[] = [];
    let clusterEnd = -1;

    const flushCluster = () => {
      if (cluster.length === 0) return;

      const laneEndTimes: number[] = [];
      const assigned = cluster.map((block) => {
        let laneIndex = laneEndTimes.findIndex((endTime) => endTime <= block.startMinutes);
        if (laneIndex === -1) {
          laneIndex = laneEndTimes.length;
          laneEndTimes.push(block.endMinutes);
        } else {
          laneEndTimes[laneIndex] = block.endMinutes;
        }

        return {
          ...block,
          columnIndex: laneIndex,
        };
      });

      const columnCount = Math.max(1, laneEndTimes.length);
      resolvedBlocks.push(...assigned.map((block) => ({ ...block, columnCount })));
      cluster = [];
      clusterEnd = -1;
    };

    for (const block of dayBlocks) {
      if (cluster.length === 0) {
        cluster = [block];
        clusterEnd = block.endMinutes;
        continue;
      }

      if (block.startMinutes < clusterEnd) {
        cluster.push(block);
        clusterEnd = Math.max(clusterEnd, block.endMinutes);
        continue;
      }

      flushCluster();
      cluster = [block];
      clusterEnd = block.endMinutes;
    }

    flushCluster();
  }

  return resolvedBlocks;
}

export function WallpaperTable({ entries, colorOverrides }: WallpaperTableProps) {
  const { settings } = useWallpaper();
  const theme = getThemePreset(settings.themeId);
  const densityConfig = {
    "ultra-compact": {
      outerPaddingX: "8px",
      outerPaddingTop: "4px",
      outerPaddingBottom: "2px",
      boardWidth: "96%",
      boardHeight: "95%",
      titleHeightPx: 32,
      titleSize: "12px",
      headerRowHeight: "22px",
      dayLabelSize: "9px",
      timeColumnWidth: settings.showTimeIndicators ? "24px" : "0px",
      timeLabelSize: "5.5px",
      minCardHeight: "34px",
      cardPaddingX: "4px",
      cardPaddingY: "4px",
      codeTight: "6.8px",
      codeNormal: "8px",
      venueTight: "4.8px",
      venueNormal: "5.8px",
      timeTight: "4.7px",
      timeNormal: "5.4px",
    },
    compact: {
      outerPaddingX: "12px",
      outerPaddingTop: "4px",
      outerPaddingBottom: "2px",
      boardWidth: "94%",
      boardHeight: "93%",
      titleHeightPx: 36,
      titleSize: "13px",
      headerRowHeight: "24px",
      dayLabelSize: "10px",
      timeColumnWidth: settings.showTimeIndicators ? "28px" : "0px",
      timeLabelSize: "6px",
      minCardHeight: "38px",
      cardPaddingX: "6px",
      cardPaddingY: "6px",
      codeTight: "6.6px",
      codeNormal: "8.2px",
      venueTight: "5.2px",
      venueNormal: "6.2px",
      timeTight: "5px",
      timeNormal: "5.8px",
    },
    comfortable: {
      outerPaddingX: "14px",
      outerPaddingTop: "6px",
      outerPaddingBottom: "4px",
      boardWidth: "92%",
      boardHeight: "90%",
      titleHeightPx: 38,
      titleSize: "13px",
      headerRowHeight: "26px",
      dayLabelSize: "10px",
      timeColumnWidth: settings.showTimeIndicators ? "30px" : "0px",
      timeLabelSize: "6.2px",
      minCardHeight: "42px",
      cardPaddingX: "7px",
      cardPaddingY: "7px",
      codeTight: "7px",
      codeNormal: "8.6px",
      venueTight: "5.5px",
      venueNormal: "6.5px",
      timeTight: "5.2px",
      timeNormal: "6px",
    },
    spacious: {
      outerPaddingX: "16px",
      outerPaddingTop: "8px",
      outerPaddingBottom: "6px",
      boardWidth: "90%",
      boardHeight: "87%",
      titleHeightPx: 40,
      titleSize: "14px",
      headerRowHeight: "28px",
      dayLabelSize: "10.5px",
      timeColumnWidth: settings.showTimeIndicators ? "32px" : "0px",
      timeLabelSize: "6.4px",
      minCardHeight: "46px",
      cardPaddingX: "8px",
      cardPaddingY: "8px",
      codeTight: "7.4px",
      codeNormal: "9px",
      venueTight: "5.8px",
      venueNormal: "6.8px",
      timeTight: "5.4px",
      timeNormal: "6.2px",
    },
  }[settings.density];

  const scheduleMetrics = useMemo(() => {
    const validEntries = entries.filter((entry) => {
      const dayIndex = getDayIndex(entry.day || "");
      return dayIndex >= 0 && entry.start && entry.end;
    });

    const startCandidates = validEntries.map((entry) => timeToMinutes(entry.start));
    const endCandidates = validEntries.map((entry) => timeToMinutes(entry.end));

    const earliestHour =
      startCandidates.length > 0
        ? Math.max(MIN_VISIBLE_HOUR, Math.floor(Math.min(...startCandidates) / 60))
        : 8;
    const latestHour =
      endCandidates.length > 0
        ? Math.min(MAX_VISIBLE_HOUR, Math.ceil(Math.max(...endCandidates) / 60))
        : 17;

    const endHour = Math.max(latestHour, earliestHour + MIN_HOUR_SPAN);
    const boundedEndHour = Math.min(MAX_VISIBLE_HOUR, endHour);
    const startHour = Math.max(MIN_VISIBLE_HOUR, Math.min(earliestHour, boundedEndHour - MIN_HOUR_SPAN));
    const totalHours = Math.max(MIN_HOUR_SPAN, boundedEndHour - startHour);
    const startMinutes = startHour * 60;
    const endMinutes = boundedEndHour * 60;
    const totalMinutes = endMinutes - startMinutes;

    const tableBlocks = assignOverlapColumns(
      entries
      .map((entry) => {
        const dayIndex = getDayIndex(entry.day || "");
        if (dayIndex < 0) return null;

        const start = timeToMinutes(entry.start || "00:00");
        const end = timeToMinutes(entry.end || "00:00");
        const clippedStart = Math.max(start, startMinutes);
        const clippedEnd = Math.min(end, endMinutes);

        if (clippedEnd <= clippedStart) return null;

        const top = ((clippedStart - startMinutes) / totalMinutes) * 100;
        const height = ((clippedEnd - clippedStart) / totalMinutes) * 100;
        const colorKey = entry.subjectKey || entry.course || "DEFAULT";
        const borderColor = colorOverrides[colorKey] || "#1f2937";
        const courseCode = entry.course || entry.subjectKey || entry.section || "CLASS";
        const normalizedCourseCode = courseCode.replace(/\s+/g, "").trim();

        return {
          id: `${entry.day}-${entry.start}-${entry.end}-${courseCode}`,
          dayIndex,
          top,
          height,
          durationMinutes: clippedEnd - clippedStart,
          courseCode: normalizedCourseCode,
          subjectName: entry.subjectName || "",
          venue: entry.venue || "",
          lecturer: entry.lecturer || "",
          start: entry.start,
          end: entry.end,
          borderColor,
          startMinutes: clippedStart,
          endMinutes: clippedEnd,
          columnIndex: 0,
          columnCount: 1,
        };
      })
      .filter((block): block is TableBlock => block !== null)
    );

    return {
      startHour,
      totalHours,
      tableBlocks,
    };
  }, [entries, colorOverrides]);

  const hourLabels = Array.from({ length: scheduleMetrics.totalHours }).map((_, index) => (
    scheduleMetrics.startHour + index
  ));
  const timeColumnWidth = densityConfig.timeColumnWidth;
  const tableBackground = theme.overlayBackground ?? "rgba(255, 255, 255, 0.95)";
  const tableText = theme.overlayTextColor ?? "#0f172a";
  const isDarkOverlay = getPerceivedBrightness(tableBackground) < 150;
  const tableBorder = isDarkOverlay ? "rgba(248, 250, 252, 0.34)" : "rgba(15, 23, 42, 0.24)";
  const tableGrid = isDarkOverlay ? "rgba(248, 250, 252, 0.24)" : "rgba(15, 23, 42, 0.18)";
  const tableHeaderText = tableText;
  const tableSubtleText = isDarkOverlay ? "rgba(248, 250, 252, 0.9)" : "rgba(15, 23, 42, 0.72)";
  const subjectText = tableText;

  return (
    <div
      className="w-full h-full"
      style={{
        paddingLeft: densityConfig.outerPaddingX,
        paddingRight: densityConfig.outerPaddingX,
        paddingTop: densityConfig.outerPaddingTop,
        paddingBottom: densityConfig.outerPaddingBottom,
      }}
    >
      <div
        className="mx-auto mt-0 rounded-[15px] overflow-hidden shadow-[0_14px_30px_rgba(0,0,0,0.08)]"
        style={{
          width: densityConfig.boardWidth,
          height: densityConfig.boardHeight,
          background: isDarkOverlay ? "rgba(30, 41, 59, 0.96)" : tableBackground,
          color: tableText,
          border: `1px solid ${tableBorder}`,
        }}
      >
        <div
          className="flex items-center justify-center font-semibold tracking-wide"
          style={{
            height: `${densityConfig.titleHeightPx}px`,
            fontSize: densityConfig.titleSize,
            borderBottom: `1px solid ${tableBorder}`,
            color: tableHeaderText,
          }}
        >
          {settings.titleText || "Class Canvas"}
        </div>

        <div
          className="grid text-[10px]"
          style={{
            height: `calc(100% - ${densityConfig.titleHeightPx}px)`,
            gridTemplateRows: settings.showDayLabels
              ? `${densityConfig.headerRowHeight} minmax(0, 1fr)`
              : "minmax(0, 1fr)",
          }}
        >
          {settings.showDayLabels ? (
            <div className="grid" style={{ gridTemplateColumns: `${timeColumnWidth} repeat(5, minmax(0, 1fr))` }}>
              <div style={{ borderRight: `1px solid ${tableGrid}` }} />
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="flex items-center justify-center px-0.5 font-semibold pt-0.5"
                  style={{
                    fontSize: densityConfig.dayLabelSize,
                    borderBottom: `1px solid ${tableGrid}`,
                    borderRight: day === DAYS[DAYS.length - 1] ? "none" : `1px solid ${tableGrid}`,
                    color: tableHeaderText,
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
          ) : null}

          <div className="grid min-h-0" style={{ gridTemplateColumns: `${timeColumnWidth} repeat(5, minmax(0, 1fr))` }}>
            {settings.showTimeIndicators ? (
              <div
                className="grid"
                style={{ gridTemplateRows: `repeat(${scheduleMetrics.totalHours}, minmax(0, 1fr))`, borderRight: `1px solid ${tableGrid}` }}
              >
                {hourLabels.map((hour) => {
                  return (
                    <div
                      key={hour}
                      className="flex items-center justify-center text-center px-0.5"
                      style={{ borderBottom: `1px solid ${tableGrid}` }}
                    >
                      <span
                        className="font-semibold leading-none tracking-[-0.02em]"
                        style={{ color: tableSubtleText, fontSize: densityConfig.timeLabelSize }}
                      >
                        {formatMinimalHourLabel(hour)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ borderRight: `1px solid ${tableGrid}` }} />
            )}

            {DAYS.map((day, dayIndex) => (
              <div
                key={day}
                className="relative min-h-0"
                style={{ borderRight: day === DAYS[DAYS.length - 1] ? "none" : `1px solid ${tableGrid}` }}
              >
                <div
                  className="absolute inset-0 grid"
                  style={{ gridTemplateRows: `repeat(${scheduleMetrics.totalHours}, minmax(0, 1fr))` }}
                >
                  {hourLabels.map((hour) => (
                    <div key={`${day}-${hour}`} style={{ borderBottom: `1px solid ${tableGrid}` }} />
                  ))}
                </div>

                {scheduleMetrics.tableBlocks
                  .filter((block) => block.dayIndex === dayIndex)
                  .map((block) => (
                    (() => {
                      const isCompact = block.durationMinutes <= 75;
                      const isTight = isCompact || block.columnCount > 1;
                      const venueLabel = formatVenueLabel(block.venue);
                      const timeLabel = settings.showTime && !isTight
                        ? settings.showTimeIndicators
                          ? block.start
                          : `${block.start} - ${block.end}`
                        : "";
                      const codeTextSize = isTight ? densityConfig.codeTight : densityConfig.codeNormal;
                      const venueTextSize = isTight ? densityConfig.venueTight : densityConfig.venueNormal;
                      const timeTextSize = isTight ? densityConfig.timeTight : densityConfig.timeNormal;

                      const widthPercent = 100 / block.columnCount;
                      const inset = 2;

                      return (
                        <div
                          key={block.id}
                          className="absolute overflow-hidden rounded-[10px] border-2 flex flex-col items-start justify-center text-left shadow-[0_3px_8px_rgba(0,0,0,0.14)]"
                          style={{
                            top: `${block.top}%`,
                            left: `calc(${block.columnIndex * widthPercent}% + ${inset}px)`,
                            width: `calc(${widthPercent}% - ${inset * 2}px)`,
                            minHeight: densityConfig.minCardHeight,
                            height: `${block.height}%`,
                            paddingLeft: densityConfig.cardPaddingX,
                            paddingRight: densityConfig.cardPaddingX,
                            paddingTop: densityConfig.cardPaddingY,
                            paddingBottom: densityConfig.cardPaddingY,
                            borderColor: block.borderColor,
                            backgroundColor: isDarkOverlay ? "rgba(255, 255, 255, 0.08)" : toSoftTint(block.borderColor, 0.24),
                          }}
                        >
                          {settings.showCourseCode ? (
                            <div
                              className="max-w-full whitespace-nowrap overflow-hidden font-black tracking-[-0.04em]"
                              style={{ color: subjectText, fontSize: codeTextSize, lineHeight: 1 }}
                            >
                              {block.courseCode}
                            </div>
                          ) : null}
                          {settings.showVenue && venueLabel ? (
                            <div
                              className="mt-0.5 max-w-full whitespace-normal break-words font-semibold"
                              style={{ color: tableSubtleText, fontSize: venueTextSize, lineHeight: 1.05 }}
                            >
                              {venueLabel}
                            </div>
                          ) : null}
                          {!isCompact && settings.showCourseName && block.subjectName ? (
                            <div className="mt-0.5 max-w-full whitespace-normal break-words text-[6.3px] leading-[1.1] font-medium" style={{ color: tableSubtleText }}>
                              {block.subjectName}
                            </div>
                          ) : null}
                          {!isCompact && settings.showLecturer && block.lecturer ? (
                            <div className="max-w-full whitespace-normal break-words text-[5.75px] leading-[1.1] mt-0.5 font-medium" style={{ color: tableSubtleText }}>
                              {block.lecturer}
                            </div>
                          ) : null}
                          {timeLabel ? (
                            <div
                              className="mt-0.5 max-w-full whitespace-normal break-words font-medium"
                              style={{ color: tableSubtleText, fontSize: timeTextSize, lineHeight: 1.05 }}
                            >
                              {timeLabel}
                            </div>
                          ) : null}
                        </div>
                      );
                    })()
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
