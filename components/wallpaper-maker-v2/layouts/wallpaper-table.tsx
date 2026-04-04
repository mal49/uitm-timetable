"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { TimetableEntry } from "@/lib/types";
import { useWallpaper } from "../wallpaper-context";
import { getThemePreset } from "../themes/theme-presets";

export interface WallpaperTableProps {
  entries: TimetableEntry[];
  colorOverrides: Record<string, string>;
  renderMode?: "preview" | "export";
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MIN_VISIBLE_HOUR = 7;
const MAX_VISIBLE_HOUR = 22;
const MIN_HOUR_SPAN = 8;
const POSITION_SLOT_MINUTES = 30;
const MOBILE_MEDIA_QUERY = "(max-width: 767px)";
const PREVIEW_SHOW_DAY_LABELS = true;
const PREVIEW_SHOW_TIME_INDICATORS = true;

type DensityConfig = {
  outerPaddingX: string;
  outerPaddingTop: string;
  outerPaddingBottom: string;
  boardWidth: string;
  boardHeight: string;
  titleHeightPx: number;
  titleSize: string;
  headerRowHeight: string;
  dayLabelSize: string;
  timeColumnWidth: string;
  timeLabelSize: string;
  minCardHeight: string;
  cardPaddingX: string;
  cardPaddingY: string;
  codeTight: string;
  codeNormal: string;
  venueTight: string;
  venueNormal: string;
  timeTight: string;
  timeNormal: string;
};

const DENSITY_PRESETS: Record<string, Omit<DensityConfig, "timeColumnWidth">> = {
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
};

function getDayIndex(day: string): number {
  const value = day.trim().toLowerCase();
  if (value.startsWith("sun")) return 0;
  if (value.startsWith("mon")) return 1;
  if (value.startsWith("tue")) return 2;
  if (value.startsWith("wed")) return 3;
  if (value.startsWith("thu")) return 4;
  if (value.startsWith("fri")) return 5;
  if (value.startsWith("sat")) return 6;
  return -1;
}

function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return (hour ?? 0) * 60 + (minute ?? 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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
  const hexMatch = value
    .trim()
    .match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
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
  return venue.trim().replace(/\s+/g, " ");
}

function formatTimeLabel(start: string, end: string): string {
  if (!start && !end) return "";
  if (!end) return start;
  return `${start} - ${end}`;
}

function getExportDetailFontSize(
  baseSizePx: number,
  text: string,
  thresholds: Array<{ maxLength: number; scale: number }>,
): string {
  const normalizedLength = text.trim().length;
  const matchedThreshold = thresholds.find(
    ({ maxLength }) => normalizedLength <= maxLength,
  );
  const scale = matchedThreshold?.scale ?? thresholds[thresholds.length - 1]?.scale ?? 1;
  return `${(baseSizePx * scale).toFixed(2)}px`;
}

function getTimeColumnWidth(showTimeIndicators: boolean, density: string): string {
  if (!showTimeIndicators) return "0px";

  const widthByDensity: Record<string, string> = {
    "ultra-compact": "24px",
    compact: "28px",
    comfortable: "30px",
    spacious: "32px",
  };

  return widthByDensity[density] ?? widthByDensity.compact;
}

function getDensityConfig(
  density: string,
  isPortrait: boolean,
  showTimeIndicators: boolean,
): DensityConfig {
  const base = DENSITY_PRESETS[density] ?? DENSITY_PRESETS.compact;
  const timeColumnWidth = getTimeColumnWidth(showTimeIndicators, density);

  return {
    ...base,
    timeColumnWidth: isPortrait
      ? showTimeIndicators
        ? `${Math.max(22, Number.parseFloat(timeColumnWidth) - 4)}px`
        : "0px"
      : timeColumnWidth,
    outerPaddingX: isPortrait
      ? `${Math.max(8, Number.parseFloat(base.outerPaddingX) - 2)}px`
      : base.outerPaddingX,
    boardWidth: isPortrait ? "93%" : base.boardWidth,
    boardHeight: isPortrait ? "85%" : base.boardHeight,
    titleHeightPx: isPortrait
      ? Math.max(30, base.titleHeightPx - 2)
      : base.titleHeightPx,
    titleSize: isPortrait
      ? `${Math.max(11.5, Number.parseFloat(base.titleSize) - 1)}px`
      : base.titleSize,
    headerRowHeight: isPortrait
      ? `${Math.max(20, Number.parseFloat(base.headerRowHeight) - 2)}px`
      : base.headerRowHeight,
    dayLabelSize: isPortrait
      ? `${Math.max(8.5, Number.parseFloat(base.dayLabelSize) - 1)}px`
      : base.dayLabelSize,
    minCardHeight: isPortrait
      ? `${Math.max(34, Number.parseFloat(base.minCardHeight) - 4)}px`
      : base.minCardHeight,
    cardPaddingX: isPortrait
      ? `${Math.max(4, Number.parseFloat(base.cardPaddingX) - 1)}px`
      : base.cardPaddingX,
    cardPaddingY: isPortrait
      ? `${Math.max(4, Number.parseFloat(base.cardPaddingY) - 1)}px`
      : base.cardPaddingY,
    codeTight: isPortrait
      ? `${Math.max(5.8, Number.parseFloat(base.codeTight) - 0.8)}px`
      : base.codeTight,
    codeNormal: isPortrait
      ? `${Math.max(7.2, Number.parseFloat(base.codeNormal) - 0.8)}px`
      : base.codeNormal,
    venueTight: isPortrait
      ? `${Math.max(4.8, Number.parseFloat(base.venueTight) - 0.4)}px`
      : base.venueTight,
    venueNormal: isPortrait
      ? `${Math.max(5.6, Number.parseFloat(base.venueNormal) - 0.4)}px`
      : base.venueNormal,
    timeTight: isPortrait
      ? `${Math.max(4.6, Number.parseFloat(base.timeTight) - 0.3)}px`
      : base.timeTight,
    timeNormal: isPortrait
      ? `${Math.max(5.2, Number.parseFloat(base.timeNormal) - 0.3)}px`
      : base.timeNormal,
  };
}

function getBlockDetailStyle(
  fontSize: string,
  isExportMode: boolean,
  color: string,
): CSSProperties {
  return {
    color,
    fontSize,
    lineHeight: isExportMode ? 1.1 : 1.12,
    textAlign: "center",
    width: "100%",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };
}

type TableBlock = {
  id: string;
  dayIndex: number;
  startSlot: number;
  slotSpan: number;
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

  for (const dayIndex of DAYS.map((_, index) => index)) {
    const dayBlocks = blocks
      .filter((block) => block.dayIndex === dayIndex)
      .sort(
        (a, b) =>
          a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes,
      );

    let cluster: TableBlock[] = [];
    let clusterEnd = -1;

    const flushCluster = () => {
      if (cluster.length === 0) return;

      const laneEndTimes: number[] = [];
      const assigned = cluster.map((block) => {
        let laneIndex = laneEndTimes.findIndex(
          (endTime) => endTime <= block.startMinutes,
        );
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
      resolvedBlocks.push(
        ...assigned.map((block) => ({ ...block, columnCount })),
      );
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

export function WallpaperTable({
  entries,
  colorOverrides,
  renderMode = "preview",
}: WallpaperTableProps) {
  const { settings } = useWallpaper();
  const isPreview = renderMode === "preview";
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const theme = getThemePreset(settings.themeId, settings.customBackground);
  const showDayLabels = isPreview ? PREVIEW_SHOW_DAY_LABELS : settings.showDayLabels;
  const showTimeIndicators = isPreview
    ? PREVIEW_SHOW_TIME_INDICATORS
    : settings.showTimeIndicators;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const updateViewportState = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    updateViewportState();
    mediaQuery.addEventListener("change", updateViewportState);

    return () => {
      mediaQuery.removeEventListener("change", updateViewportState);
    };
  }, []);

  const activeDays = useMemo(() => {
    const used = DAYS.filter((day) =>
      entries.some(
        (entry) => getDayIndex(entry.day || "") === DAYS.indexOf(day),
      ),
    );
    return used.length > 0 ? used : DAYS;
  }, [entries]);
  const isPortrait = settings.orientation === "portrait";
  const densityConfig = useMemo(
    () => getDensityConfig(settings.density, isPortrait, showTimeIndicators),
    [settings.density, isPortrait, showTimeIndicators],
  );

  const scheduleMetrics = useMemo(() => {
    const validEntries = entries.filter((entry) => {
      const dayIndex = getDayIndex(entry.day || "");
      return dayIndex >= 0 && entry.start && entry.end;
    });

    const startCandidates = validEntries.map((entry) =>
      timeToMinutes(entry.start),
    );
    const endCandidates = validEntries.map((entry) => timeToMinutes(entry.end));

    const earliestHour =
      startCandidates.length > 0
        ? Math.max(
            MIN_VISIBLE_HOUR,
            Math.floor(Math.min(...startCandidates) / 60),
          )
        : 8;
    const latestHour =
      endCandidates.length > 0
        ? Math.min(MAX_VISIBLE_HOUR, Math.ceil(Math.max(...endCandidates) / 60))
        : 17;

    const endHour = Math.max(latestHour, earliestHour + MIN_HOUR_SPAN);
    const boundedEndHour = Math.min(MAX_VISIBLE_HOUR, endHour);
    const startHour = Math.max(
      MIN_VISIBLE_HOUR,
      Math.min(earliestHour, boundedEndHour - MIN_HOUR_SPAN),
    );
    const totalHours = Math.max(MIN_HOUR_SPAN, boundedEndHour - startHour);
    const startMinutes = startHour * 60;
    const endMinutes = boundedEndHour * 60;
    const totalMinutes = endMinutes - startMinutes;
    const totalSlots = totalMinutes / POSITION_SLOT_MINUTES;

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

          const colorKey = entry.subjectKey || entry.course || "DEFAULT";
          const borderColor = colorOverrides[colorKey] || "#1f2937";
          const courseCode =
            entry.course || entry.subjectKey || entry.section || "CLASS";
          const normalizedCourseCode = courseCode.replace(/\s+/g, "").trim();

          return {
            id: `${entry.day}-${entry.start}-${entry.end}-${courseCode}`,
            dayIndex,
            startSlot: (clippedStart - startMinutes) / POSITION_SLOT_MINUTES,
            slotSpan: (clippedEnd - clippedStart) / POSITION_SLOT_MINUTES,
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
        .filter((block): block is TableBlock => block !== null),
    );

    return {
      startHour,
      totalHours,
      totalSlots,
      tableBlocks,
    };
  }, [entries, colorOverrides]);

  const hourLabels = Array.from({ length: scheduleMetrics.totalHours }).map(
    (_, index) => scheduleMetrics.startHour + index,
  );
  const dayCount = activeDays.length;
  const timeColumnWidth = densityConfig.timeColumnWidth;
  const tableBackground =
    theme.overlayBackground ?? "rgba(255, 255, 255, 0.95)";
  const tableText = theme.overlayTextColor ?? "#0f172a";
  const isDarkOverlay = getPerceivedBrightness(tableBackground) < 150;
  const tableBorder = isDarkOverlay
    ? "rgba(248, 250, 252, 0.34)"
    : "rgba(15, 23, 42, 0.24)";
  const tableGrid = isDarkOverlay
    ? "rgba(248, 250, 252, 0.24)"
    : "rgba(15, 23, 42, 0.18)";
  const tableHeaderText = tableText;
  const tableSubtleText = isDarkOverlay
    ? "rgba(248, 250, 252, 0.9)"
    : "rgba(15, 23, 42, 0.72)";
  const subjectText = tableText;

  return (
    <div
      className="w-full h-full"
      style={{
        paddingLeft: densityConfig.outerPaddingX,
        paddingRight: densityConfig.outerPaddingX,
        paddingTop: densityConfig.outerPaddingTop,
        paddingBottom: densityConfig.outerPaddingBottom,
      }}>
      <div
        className="mx-auto mt-0 rounded-[15px] overflow-hidden"
        style={{
          width: densityConfig.boardWidth,
          height: densityConfig.boardHeight,
          background: isDarkOverlay
            ? "rgba(30, 41, 59, 0.96)"
            : tableBackground,
          color: tableText,
          border: `1px solid ${tableBorder}`,
        }}>
        <div
          className="flex items-center justify-center font-semibold tracking-wide"
          style={{
            height: `${densityConfig.titleHeightPx}px`,
            fontSize: densityConfig.titleSize,
            borderBottom: `1px solid ${tableBorder}`,
            color: tableHeaderText,
          }}>
          {settings.titleText || "Class Canvas"}
        </div>

        <div
          className="grid text-[10px]"
          style={{
            height: `calc(100% - ${densityConfig.titleHeightPx}px)`,
            gridTemplateRows: showDayLabels
              ? `${densityConfig.headerRowHeight} minmax(0, 1fr)`
              : "minmax(0, 1fr)",
          }}>
          {showDayLabels ? (
            <div
              className="grid"
              style={{
                gridTemplateColumns: `${timeColumnWidth} repeat(${dayCount}, minmax(0, 1fr))`,
              }}>
              <div style={{ borderRight: `1px solid ${tableGrid}` }} />
              {activeDays.map((day) => (
                <div
                  key={day}
                  className="flex items-center justify-center px-0.5 font-semibold pt-0.5"
                  style={{
                    fontSize: densityConfig.dayLabelSize,
                    borderBottom: `1px solid ${tableGrid}`,
                    borderRight:
                      day === activeDays[activeDays.length - 1]
                        ? "none"
                        : `1px solid ${tableGrid}`,
                    color: tableHeaderText,
                  }}>
                  {day}
                </div>
              ))}
            </div>
          ) : null}

          <div
            className="grid min-h-0"
            style={{
              gridTemplateColumns: `${timeColumnWidth} repeat(${dayCount}, minmax(0, 1fr))`,
            }}>
            {showTimeIndicators ? (
              <div
                className="grid"
                style={{
                  gridTemplateRows: `repeat(${scheduleMetrics.totalHours}, minmax(0, 1fr))`,
                  borderRight: `1px solid ${tableGrid}`,
                }}>
                {hourLabels.map((hour) => {
                  return (
                    <div
                      key={hour}
                      className="flex items-center justify-center text-center px-0.5"
                      style={{ boxShadow: `inset 0 -1px 0 ${tableGrid}` }}>
                      <span
                        className="font-semibold leading-none tracking-[-0.02em]"
                        style={{
                          color: tableSubtleText,
                          fontSize: densityConfig.timeLabelSize,
                        }}>
                        {formatMinimalHourLabel(hour)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ borderRight: `1px solid ${tableGrid}` }} />
            )}

            {activeDays.map((day) => {
              const dayIndex = DAYS.indexOf(day);
              return (
                <div
                  key={day}
                  className="relative min-h-0 overflow-hidden"
                  style={{
                    borderRight:
                      day === activeDays[activeDays.length - 1]
                        ? "none"
                        : `1px solid ${tableGrid}`,
                    contain: "paint",
                  }}>
                  <div
                    className="pointer-events-none absolute inset-0 grid"
                    style={{
                      gridTemplateRows: `repeat(${scheduleMetrics.totalHours}, minmax(0, 1fr))`,
                      zIndex: 2,
                    }}>
                    {hourLabels.map((hour) => (
                      <div
                        key={`${day}-${hour}`}
                        style={{ boxShadow: `inset 0 -1px 0 ${tableGrid}` }}
                      />
                    ))}
                  </div>

                  {scheduleMetrics.tableBlocks
                    .filter((block) => block.dayIndex === dayIndex)
                    .map((block) =>
                      (() => {
                        const isExportMode = renderMode === "export";
                        const isCompact = block.durationMinutes <= 75;
                        const isTight = isCompact || block.columnCount > 1;
                        const venueLabel = formatVenueLabel(block.venue);
                        const timeLabel = formatTimeLabel(
                          block.start,
                          block.end,
                        );
                        const baseCodeTextSize = Number.parseFloat(
                          isTight
                            ? densityConfig.codeTight
                            : densityConfig.codeNormal,
                        );
                        const codeLength = block.courseCode.length;
                        const blockWidthScore = Math.sqrt(
                          7 / Math.max(1, dayCount * block.columnCount),
                        );
                        const blockHeightScore = clamp(
                          0.82 + block.slotSpan * 0.18,
                          0.92,
                          1.44,
                        );
                        const readableBoost = clamp(
                          Math.sqrt(blockWidthScore * blockHeightScore),
                          1,
                          1.9,
                        );
                        const tightFitPenalty =
                          dayCount >= 5 || block.columnCount > 1 ? 0.8 : 1;
                        const isOneHourBlock = block.slotSpan <= 2;
                        const prioritizeCodeOnly =
                          renderMode === "preview"
                            ? isOneHourBlock ||
                              block.columnCount > 1 ||
                              dayCount >= 5 ||
                              block.slotSpan < 1.85 ||
                              codeLength >= 8
                            : block.columnCount > 1 ||
                              dayCount >= 6 ||
                              block.slotSpan < 1.6 ||
                              codeLength >= 11;
                        const codeScale =
                          codeLength >= 10
                            ? 0.78
                            : codeLength >= 8
                              ? 0.86
                              : codeLength >= 6
                                ? 0.92
                                : 1;
                        const codeDensityPenalty =
                          isPortrait && (isOneHourBlock || dayCount >= 6)
                            ? codeLength >= 8
                              ? 0.92
                              : 0.96
                            : 1;
                        const previewTightCodePenalty =
                          renderMode === "preview" &&
                          isPortrait &&
                          (isOneHourBlock ||
                            block.columnCount > 1 ||
                            dayCount >= 6)
                            ? codeLength >= 6
                              ? 0.92
                              : 0.96
                            : 1;
                        const codeFitScaleX = clamp(
                          (codeLength >= 12
                            ? 0.58
                            : codeLength >= 10
                              ? 0.66
                              : codeLength >= 8
                                ? 0.76
                                : codeLength >= 6
                                  ? 0.84
                                  : 0.92) *
                            (isPortrait &&
                            (block.columnCount > 1 ||
                              dayCount >= 6 ||
                              isOneHourBlock)
                              ? 0.92
                              : 1),
                          0.58,
                          1,
                        );
                        const previewCodeFitScaleX = clamp(
                          codeFitScaleX *
                            (renderMode === "preview" &&
                            isPortrait &&
                            (isOneHourBlock ||
                              block.columnCount > 1 ||
                              dayCount >= 6)
                              ? 0.9
                              : 1),
                          0.54,
                          1,
                        );
                        const resolvedCodeSize = `${(
                          baseCodeTextSize *
                          codeScale *
                          codeDensityPenalty *
                          previewTightCodePenalty *
                          (isExportMode ? 0.84 : 1) *
                          tightFitPenalty *
                          (renderMode === "preview"
                            ? isPortrait && (isOneHourBlock || dayCount >= 6)
                              ? 1.22
                              : 1.34
                            : 1) *
                          clamp(
                            readableBoost * (prioritizeCodeOnly ? 1.18 : 1),
                            1,
                            2.1,
                          )
                        ).toFixed(2)}px`;
                        const showCourseCode =
                          isPreview || settings.showCourseCode;
                        const showSupportingDetails =
                          !(renderMode === "preview" && isMobileViewport) &&
                          !isOneHourBlock;
                        const showVenueDetails =
                          showSupportingDetails &&
                          settings.showVenue &&
                          Boolean(venueLabel);
                        const showTimeDetails =
                          showSupportingDetails &&
                          settings.showTime &&
                          Boolean(timeLabel);
                        const detailRowCount =
                          Number(showVenueDetails) + Number(showTimeDetails);
                        const showCourseNameDetails =
                          showSupportingDetails &&
                          !isCompact &&
                          settings.showCourseName &&
                          Boolean(block.subjectName);
                        const showLecturerDetails =
                          showSupportingDetails &&
                          !isCompact &&
                          settings.showLecturer &&
                          Boolean(block.lecturer);
                        const venueTextSize = `${(
                          Number.parseFloat(
                            isTight
                              ? densityConfig.venueTight
                              : densityConfig.venueNormal,
                          ) * clamp(readableBoost * 0.86, 0.96, 1.45)
                        ).toFixed(2)}px`;
                        const exportVenueTextSize =
                          renderMode === "export"
                            ? getExportDetailFontSize(
                                Number.parseFloat(venueTextSize),
                                venueLabel,
                                [
                                  { maxLength: 18, scale: 1 },
                                  { maxLength: 28, scale: 0.92 },
                                  { maxLength: 40, scale: 0.84 },
                                  { maxLength: 56, scale: 0.76 },
                                  { maxLength: Number.POSITIVE_INFINITY, scale: 0.68 },
                                ],
                              )
                            : venueTextSize;
                        const timeTextSize = `${(
                          Number.parseFloat(
                            isTight
                              ? densityConfig.timeTight
                              : densityConfig.timeNormal,
                          ) * clamp(readableBoost * 0.9, 0.98, 1.5)
                        ).toFixed(2)}px`;
                        const exportTimeTextSize =
                          renderMode === "export"
                            ? getExportDetailFontSize(
                                Number.parseFloat(timeTextSize),
                                timeLabel,
                                [
                                  { maxLength: 13, scale: 1 },
                                  { maxLength: 17, scale: 0.92 },
                                  { maxLength: 24, scale: 0.84 },
                                  { maxLength: Number.POSITIVE_INFINITY, scale: 0.76 },
                                ],
                              )
                            : timeTextSize;
                        const detailSizeScale =
                          isExportMode && detailRowCount >= 2 ? 0.88 : 1;
                        const resolvedVenueTextSize = `${(
                          Number.parseFloat(exportVenueTextSize) * detailSizeScale
                        ).toFixed(2)}px`;
                        const resolvedTimeTextSize = `${(
                          Number.parseFloat(exportTimeTextSize) * detailSizeScale
                        ).toFixed(2)}px`;
                        const venueDetailStyle = getBlockDetailStyle(
                          resolvedVenueTextSize,
                          isExportMode,
                          isDarkOverlay
                            ? "rgba(248, 250, 252, 0.96)"
                            : "rgba(15, 23, 42, 0.86)",
                        );
                        const timeDetailStyle = getBlockDetailStyle(
                          resolvedTimeTextSize,
                          isExportMode,
                          isDarkOverlay
                            ? "rgba(248, 250, 252, 0.92)"
                            : "rgba(15, 23, 42, 0.82)",
                        );

                        const widthPercent = 100 / block.columnCount;
                        const inset = 2;
                        const verticalInset = 2;
                        const compactPaddingY = isCompact
                          ? `${Math.max(
                              2,
                              Number.parseFloat(densityConfig.cardPaddingY) - 1,
                            )}px`
                          : densityConfig.cardPaddingY;
                        const compactPaddingX = prioritizeCodeOnly
                          ? `${Math.max(
                              2,
                              Number.parseFloat(densityConfig.cardPaddingX) - 2,
                            )}px`
                          : densityConfig.cardPaddingX;
                        const exportPaddingY = `${Math.max(
                          2,
                          Number.parseFloat(compactPaddingY) - 1,
                        )}px`;
                        const exportPaddingX = `${Math.max(
                          2,
                          Number.parseFloat(compactPaddingX) - 1,
                        )}px`;
                        const contentAlignItems =
                          isExportMode && !prioritizeCodeOnly
                            ? "stretch"
                            : "center";
                        const contentJustify =
                          isExportMode && !prioritizeCodeOnly
                            ? "flex-start"
                            : "center";
                        const contentGap =
                          isExportMode && !prioritizeCodeOnly ? "1px" : "0px";

                        return (
                          <div
                            key={block.id}
                            className="absolute flex flex-col overflow-hidden rounded-[10px] border-2 text-center"
                            style={{
                              top: `calc((100% / ${scheduleMetrics.totalSlots}) * ${block.startSlot} + ${verticalInset}px)`,
                              left: `calc(${block.columnIndex * widthPercent}% + ${inset}px)`,
                              width: `calc(${widthPercent}% - ${inset * 2}px)`,
                              height: `calc((100% / ${scheduleMetrics.totalSlots}) * ${block.slotSpan} - ${verticalInset * 2}px)`,
                              paddingLeft: isExportMode
                                ? exportPaddingX
                                : compactPaddingX,
                              paddingRight: isExportMode
                                ? exportPaddingX
                                : compactPaddingX,
                              paddingTop: isExportMode
                                ? exportPaddingY
                                : compactPaddingY,
                              paddingBottom: isExportMode
                                ? exportPaddingY
                                : compactPaddingY,
                              borderColor: block.borderColor,
                              backgroundColor: isDarkOverlay
                                ? "rgba(255, 255, 255, 0.08)"
                                : toSoftTint(block.borderColor, 0.24),
                              alignItems: contentAlignItems,
                              justifyContent: contentJustify,
                              gap: contentGap,
                              zIndex: 1,
                            }}>
                            {showCourseCode ? (
                              <div
                                className="max-w-full overflow-hidden whitespace-nowrap font-black"
                                style={{
                                  color: subjectText,
                                  fontSize: resolvedCodeSize,
                                  lineHeight: 1,
                                  width: "100%",
                                  letterSpacing:
                                    codeLength >= 8
                                      ? isExportMode
                                        ? "-0.04em"
                                        : "-0.06em"
                                      : "-0.045em",
                                  transform: isExportMode
                                    ? "none"
                                    : `scaleX(${previewCodeFitScaleX})`,
                                  transformOrigin: isExportMode
                                    ? "initial"
                                    : "center center",
                                  textAlign: "center",
                                }}>
                                {block.courseCode}
                              </div>
                            ) : null}
                            {showVenueDetails ? (
                              <div
                                className="max-w-full font-semibold"
                                title={venueLabel}
                                style={venueDetailStyle}>
                                {venueLabel}
                              </div>
                            ) : null}
                            {showCourseNameDetails ? (
                              <div
                                className="max-w-full whitespace-normal wrap-break-word text-[6.3px] leading-[1.1] font-medium"
                                style={{
                                  color: tableSubtleText,
                                  textAlign: "center",
                                }}>
                                {block.subjectName}
                              </div>
                            ) : null}
                            {showLecturerDetails ? (
                              <div
                                className="max-w-full whitespace-normal wrap-break-word text-[5.75px] leading-[1.1] font-medium"
                                style={{
                                  color: tableSubtleText,
                                  textAlign: "center",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: "vertical",
                                }}>
                                {block.lecturer}
                              </div>
                            ) : null}
                            {showTimeDetails ? (
                              <div
                                className="max-w-full font-medium"
                                title={timeLabel}
                                style={timeDetailStyle}>
                                {timeLabel}
                              </div>
                            ) : null}
                          </div>
                        );
                      })(),
                    )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
