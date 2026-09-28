/* eslint-disable @next/next/no-img-element -- plain <img> so html-to-image can inline it in the hidden export node */
"use client";

import type { CSSProperties, ReactNode } from "react";
import type { StyleId, TableStyle, WallpaperSettings } from "../wallpaper-context";
import { getThemePreset } from "../themes/theme-presets";
import {
  DAY_LONG,
  DAY_SHORT,
  DAY_TITLE,
  HARI_LONG,
  HARI_SHORT,
  academicSession,
  darken,
  hourLabel,
  isDark,
  joinNames,
  malayHour,
  timeRange,
  type Week,
  type WeekClass,
  type WeekDay,
} from "./week-model";

/** Every style is drawn on a 347 × 753 design canvas (1179 × 2556 at export) and scaled to the target surface. */
export const CANVAS_WIDTH = 347;
export const CANVAS_HEIGHT = 753;

const SANS = "var(--font-inter), Inter, sans-serif";
const FRAUNCES = "var(--font-fraunces), Georgia, serif";
const PLAYFAIR = "var(--font-playfair), Georgia, serif";

type Ctx = { week: Week; settings: WallpaperSettings; session: [number, number]; scale: number };

type StyleDef = {
  id: StyleId;
  name: string;
  /** Lock-screen clock colour for the preview overlay. */
  lock: string;
  background: string;
  render: (ctx: Ctx) => ReactNode;
};

/* ---------- shared pieces ---------- */

function Column({ ctx, pad, gap, children }: { ctx: Ctx; pad: [number, number, number]; gap: number; children: ReactNode }) {
  const [top, x, bottom] = pad;
  return (
    <div
      data-surface
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap,
        height: "100%",
        padding: `${ctx.settings.showWidgetPosition ? top : top - 50}px ${x}px ${bottom}px`,
      }}
    >
      {children}
    </div>
  );
}

// flexShrink 0 keeps the course code visible when a short class block runs out of height.
const ellipsis: CSSProperties = { flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

type LineColors = { code: string; time: string; room: string; roomWeight?: number; codeSpacing?: number; dot?: (item: WeekClass) => string };

function ClassLine({ item, settings, colors, gap = 8, dot = 6 }: { item: WeekClass; settings: WallpaperSettings; colors: LineColors; gap?: number; dot?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap, fontSize: 12, lineHeight: "15px" }}>
      {dot ? <span style={{ width: dot, height: dot, borderRadius: 99, flexShrink: 0, background: colors.dot?.(item) ?? item.color }} /> : null}
      <span style={{ fontWeight: 700, color: colors.code, letterSpacing: colors.codeSpacing }}>{item.code}</span>
      {settings.showTime ? <span style={{ color: colors.time, whiteSpace: "nowrap" }}>{timeRange(item)}</span> : null}
      <span style={{ flex: 1 }} />
      {settings.showVenue && item.room ? (
        <span style={{ ...ellipsis, maxWidth: "45%", fontSize: 11, fontWeight: colors.roomWeight ?? 400, color: colors.room }}>{item.room}</span>
      ) : null}
    </div>
  );
}

function DayList({
  ctx,
  label,
  labelStyle,
  labelWidth,
  rowStyle,
  colors,
  rowGap = 12,
  lineGap = 4,
  lineInnerGap,
  dot,
  empty = "Free",
}: {
  ctx: Ctx;
  label: (day: WeekDay) => string;
  labelStyle: CSSProperties;
  labelWidth: number;
  rowStyle: (index: number) => CSSProperties;
  colors: LineColors;
  rowGap?: number;
  lineGap?: number;
  lineInnerGap?: number;
  dot?: number;
  empty?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {ctx.week.days.map((day, index) => (
        <div key={day.index} style={{ display: "flex", gap: rowGap, ...rowStyle(index) }}>
          <span style={{ width: labelWidth, flexShrink: 0, ...labelStyle }}>{label(day)}</span>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: lineGap }}>
            {day.classes.length ? (
              day.classes.map((item, i) => (
                <ClassLine key={i} item={item} settings={ctx.settings} colors={colors} gap={lineInnerGap} dot={dot} />
              ))
            ) : (
              <span style={{ fontSize: 12, lineHeight: "15px", color: colors.room }}>{empty}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function freeDaysText(week: Week, names: string[]) {
  return week.freeDays.length ? joinNames(week.freeDays.map((index) => names[index]!)) : "";
}

/** Positions a class inside a day column by time, as a percentage of the visible hours. */
function timeBox(item: WeekClass, week: Week, inset: { x: number; y: number }): CSSProperties {
  const span = (week.endHour - week.startHour) * 60;
  const offset = item.start - week.startHour * 60;
  return {
    position: "absolute",
    left: 0,
    right: inset.x,
    top: `${(offset / span) * 100}%`,
    height: `calc(${((item.end - item.start) / span) * 100}% - ${inset.y}px)`,
    overflow: "hidden",
  };
}

/* ---------- Heritage family ---------- */

type HeritagePalette = {
  gold: string;
  rule: string;
  title: string;
  fill: string;
  stroke: string;
  text: string;
  sub: string;
  crest: number;
  foot: string;
};

const HERITAGE: HeritagePalette = {
  gold: "#E6B34A",
  rule: "#E6B34A80",
  title: "#F5E6C4",
  fill: "#E6B34A14",
  stroke: "#E6B34A",
  text: "#F5E6C4",
  sub: "#F5E6C499",
  crest: 0.07,
  foot: "#E6B34AB3",
};

function Crest({ opacity }: { opacity: number }) {
  return (
    <img
      src="/uitm-logo.png"
      alt=""
      style={{ position: "absolute", left: 73, top: 390, width: 200, height: 250, objectFit: "contain", opacity }}
    />
  );
}

function HeritageHead({ ctx, p }: { ctx: Ctx; p: HeritagePalette }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2.5, color: p.gold }}>
        SESI {ctx.session[0]}/{ctx.session[1]}
      </span>
      <span style={{ fontFamily: PLAYFAIR, fontSize: 26, lineHeight: "35px", color: p.title }}>Jadual Kuliah</span>
    </div>
  );
}

function Diamond({ size, color }: { size: number; color: string }) {
  const side = size / Math.SQRT2;
  return (
    <span style={{ width: size, height: size, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ width: side, height: side, background: color, transform: "rotate(45deg)" }} />
    </span>
  );
}

function HeritageRule({ p }: { p: HeritagePalette }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, height: 8 }}>
      <span style={{ flex: 1, height: 1, background: p.rule }} />
      <Diamond size={8} color={p.gold} />
      <span style={{ flex: 1, height: 1, background: p.rule }} />
    </div>
  );
}

function SongketBand({ p }: { p: HeritagePalette }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ height: 1, background: p.gold }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 11 }}>
        {Array.from({ length: 15 }, (_, i) => (
          <Diamond key={i} size={i % 2 ? 7 : 11} color={i % 2 ? "#C0266D" : p.gold} />
        ))}
      </div>
      <span style={{ height: 1, background: p.gold }} />
    </div>
  );
}

function HeritageGrid({ ctx, p, subSize = 8, blockStyle }: { ctx: Ctx; p: HeritagePalette; subSize?: number; blockStyle?: CSSProperties }) {
  const { week, settings } = ctx;
  return (
    <div style={{ display: "flex", gap: 5, height: 250, flexShrink: 0 }}>
      {week.days.map((day) => (
        <div key={day.index} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 10, lineHeight: "12px", fontWeight: 700, letterSpacing: 1, textAlign: "center", color: p.gold }}>
            {HARI_SHORT[day.index]}
          </span>
          <div style={{ position: "relative", flex: 1 }}>
            {day.classes.map((item, i) => (
              <div
                key={i}
                style={{
                  ...timeBox(item, week, { x: 2, y: 4 }),
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  padding: 5,
                  borderRadius: 4,
                  border: `1px solid ${p.stroke}`,
                  background: p.fill,
                  ...blockStyle,
                }}
              >
                <span style={{ ...ellipsis, fontSize: 8, lineHeight: "10px", fontWeight: 700, color: p.text }}>{item.code}</span>
                <span style={{ fontSize: subSize, lineHeight: 1.25, color: p.sub }}>
                  {[settings.showVenue && item.room, settings.showTime && timeRange(item)].filter(Boolean).join(" · ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function HeritageFoot({ ctx, p, withHours = true }: { ctx: Ctx; p: HeritagePalette; withHours?: boolean }) {
  const free = freeDaysText(ctx.week, HARI_LONG);
  const parts = [
    withHours && `${malayHour(ctx.week.startHour)} — ${malayHour(ctx.week.endHour)}`,
    free && `${free} CUTI`,
  ].filter(Boolean);
  return (
    <span style={{ fontSize: 9, lineHeight: 1.5, fontWeight: 600, letterSpacing: 2, textAlign: "center", color: p.foot }}>
      {parts.join("  ·  ").toUpperCase()}
    </span>
  );
}

function heritage(p: HeritagePalette, variant: "grid" | "songket" | "almanac" = "grid") {
  return function render(ctx: Ctx) {
    return (
      <Column ctx={ctx} pad={[244, 20, 112]} gap={variant === "songket" ? 11 : 14}>
        <Crest opacity={p.crest} />
        <HeritageHead ctx={ctx} p={p} />
        {variant === "songket" ? <SongketBand p={p} /> : <HeritageRule p={p} />}
        {variant === "almanac" ? (
          <DayList
            ctx={ctx}
            label={(day) => HARI_LONG[day.index]!}
            labelWidth={82}
            labelStyle={{ fontFamily: PLAYFAIR, fontSize: 18, lineHeight: 1.1, color: p.gold }}
            rowGap={10}
            rowStyle={() => ({ padding: "9px 4px", borderTop: `1px solid ${p.gold}4D` })}
            colors={{ code: p.text, codeSpacing: 0.5, time: `${p.text}B3`, room: `${p.gold}CC`, roomWeight: 600 }}
            dot={0}
            empty="Cuti"
          />
        ) : (
          <HeritageGrid ctx={ctx} p={p} />
        )}
        <span style={{ flex: 1 }} />
        {variant === "songket" ? <SongketBand p={p} /> : null}
        <HeritageFoot ctx={ctx} p={p} withHours={variant !== "almanac"} />
      </Column>
    );
  };
}

/* ---------- light & playful styles ---------- */

function paperAgenda(ctx: Ctx) {
  const free = freeDaysText(ctx.week, DAY_LONG);
  return (
    <Column ctx={ctx} pad={[240, 24, 112]} gap={12}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <span style={{ fontFamily: FRAUNCES, fontSize: 28, lineHeight: "35px", fontWeight: 500, letterSpacing: -0.5, color: "#1E1A16" }}>My week</span>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: "#8A7F70" }}>
          SESI {String(ctx.session[0]).slice(2)}/{String(ctx.session[1]).slice(2)}
        </span>
      </div>
      <div>
        <DayList
          ctx={ctx}
          label={(day) => DAY_TITLE[day.index]!}
          labelWidth={46}
          labelStyle={{ fontFamily: FRAUNCES, fontSize: 19, lineHeight: "23px", color: "#1E1A16" }}
          rowStyle={() => ({ padding: "9px 0", borderTop: "1px solid #D8CFC2" })}
          colors={{ code: "#1E1A16", time: "#4A433B", room: "#8A7F70", dot: (item) => darken(item.color, 0.35) }}
        />
        <div style={{ height: 1, background: "#D8CFC2" }} />
      </div>
      {free ? <span style={{ fontFamily: FRAUNCES, fontSize: 13, color: "#8A7F70" }}>{free} free</span> : null}
    </Column>
  );
}

/* ---------- table bodies (shared by the styles and the custom Colour / Photo backgrounds) ---------- */

/** Text and line colours for a table drawn over a background of unknown colour. */
type Ink = {
  dark: boolean; // dark text, for light backgrounds
  text: string;
  sub: string;
  muted: string;
  faint: string;
  ghost: string;
  line: string;
  surface: string;
  surfaceLine: string;
};

const LIGHT_INK: Ink = {
  dark: false,
  text: "#FFFFFF",
  sub: "#FFFFFFCC",
  muted: "#FFFFFF99",
  faint: "#FFFFFF66",
  ghost: "#FFFFFF14",
  line: "#FFFFFF26",
  surface: "#FFFFFF1A",
  surfaceLine: "#FFFFFF2E",
};

const DARK_INK: Ink = {
  dark: true,
  text: "#11181C",
  sub: "#11181CB3",
  muted: "#11181C99",
  faint: "#11181C66",
  ghost: "#11181C14",
  line: "#11181C1F",
  surface: "#FFFFFF8C",
  surfaceLine: "#FFFFFFB3",
};

function TableHead({ ctx, ink }: { ctx: Ctx; ink: Ink }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 2px 4px" }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: ink.text }}>This week</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: ink.sub }}>
        Sesi {String(ctx.session[0]).slice(2)}/{String(ctx.session[1]).slice(2)}
      </span>
    </div>
  );
}

function AgendaBody({ ctx, ink, rowPadding = "5px 0" }: { ctx: Ctx; ink: Ink; rowPadding?: string }) {
  return (
    <DayList
      ctx={ctx}
      label={(day) => DAY_SHORT[day.index]!}
      labelWidth={34}
      labelStyle={{ fontSize: 11, lineHeight: "13px", fontWeight: 800, letterSpacing: 1, color: ink.text }}
      rowGap={10}
      rowStyle={() => ({ padding: rowPadding })}
      colors={{ code: ink.text, time: ink.sub, room: ink.sub, roomWeight: 600 }}
      lineGap={3}
      lineInnerGap={7}
      dot={7}
    />
  );
}

function CardsBody({ ctx, ink }: { ctx: Ctx; ink: Ink }) {
  const { week, settings } = ctx;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {week.days.map((day) => (
        <div
          key={day.index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: 18,
            background: ink.surface,
            border: `1px solid ${ink.surfaceLine}`,
            backdropFilter: "blur(24px)",
          }}
        >
          <span style={{ width: 36, flexShrink: 0, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: ink.text }}>{DAY_SHORT[day.index]}</span>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexWrap: "wrap", gap: 6, minHeight: 35 }}>
            {day.classes.length ? (
              day.classes.map((item, i) => (
                <div
                  key={i}
                  style={{
                    width: "calc(50% - 3px)",
                    padding: "5px 8px",
                    borderRadius: 10,
                    background: `${item.color}${ink.dark ? "59" : "38"}`,
                    border: `1px solid ${item.color}${ink.dark ? "B3" : "80"}`,
                  }}
                >
                  <div style={{ fontSize: 11, lineHeight: "13px", fontWeight: 700, color: ink.text }}>{item.code}</div>
                  <div style={{ ...ellipsis, fontSize: 10, lineHeight: "12px", color: ink.sub }}>
                    {[settings.showTime && timeRange(item), settings.showVenue && item.room].filter(Boolean).join(" · ")}
                  </div>
                </div>
              ))
            ) : (
              <span style={{ alignSelf: "center", fontSize: 11, color: ink.muted }}>Free</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function BentoBody({ ctx }: { ctx: Ctx }) {
  const { week, settings } = ctx;
  const ink = "#2A1B4A";
  const free = week.freeDays.map((index) => DAY_TITLE[index]!);
  const stats = [
    [String(week.subjects.length), "subjects"],
    [String(week.classCount), "classes/wk"],
    ...(free.length ? [[free.length === 2 ? free.join("–") : String(free.length), free.length === 2 ? "free" : "days free"]] : []),
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 18, background: "#B9A3F0" }}>
        {stats.map(([value, label]) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: ink }}>{value}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: `${ink}B3` }}>{label}</span>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 12, borderRadius: 22, background: "#FFFFFF" }}>
        {week.days.map((day, index) => {
          const lines = Array.from({ length: Math.max(1, Math.ceil(day.classes.length / 4)) }, (_, i) => day.classes.slice(i * 4, i * 4 + 4));
          return (
            <div
              key={day.index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingBottom: index < week.days.length - 1 ? 6 : 0,
                borderBottom: index < week.days.length - 1 ? "1px solid #EEE9F7" : "none",
              }}
            >
              <div style={{ width: 28, flexShrink: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#8C82A6" }}>{DAY_TITLE[day.index]}</span>
                {day.classes.length >= 5 ? <span style={{ fontSize: 9, fontWeight: 700, color: "#C0266D" }}>×{day.classes.length}</span> : null}
              </div>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {day.classes.length ? (
                  lines.map((line, i) => (
                    <div key={i} style={{ display: "flex", gap: 4 }}>
                      {Array.from({ length: 4 }, (_, slot) => {
                        const item = line[slot];
                        if (!item) return <span key={slot} style={{ flex: 1 }} />;
                        const text = isDark(item.color) ? "#FFFFFF" : ink;
                        return (
                          <div key={slot} style={{ flex: 1, minWidth: 0, padding: "5px 7px", borderRadius: 10, background: item.color }}>
                            <div style={{ ...ellipsis, fontSize: 10, lineHeight: "12px", fontWeight: 800, color: text }}>{item.code}</div>
                            {settings.showTime ? (
                              <div style={{ fontSize: 9, lineHeight: "11px", fontWeight: 600, color: `${text}B3` }}>{timeRange(item)}</div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#8C82A6" }}>Free</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {settings.showVenue ? (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 6, padding: "9px 14px", borderRadius: 18, background: "#FFFFFFB3" }}>
          {week.subjects.map((item) => (
            <span key={item.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: item.color }} />
              <span style={{ fontSize: 10, lineHeight: "12px", fontWeight: 700, color: ink }}>{item.room || item.code}</span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TimeGridBody({ ctx, ink, block }: { ctx: Ctx; ink: Ink; block: (item: WeekClass) => { bg: string; text: string; sub: string } }) {
  const { week, settings } = ctx;
  const hours = Array.from({ length: week.endHour - week.startHour }, (_, i) => week.startHour + i);
  return (
    <div style={{ display: "flex", height: 306, flexShrink: 0 }}>
      <div style={{ width: 24, flexShrink: 0, display: "flex", flexDirection: "column", paddingTop: 18 }}>
        {hours.map((hour) => (
          <span key={hour} style={{ flex: 1, fontSize: 9, lineHeight: "11px", fontWeight: 600, color: ink.muted }}>{hourLabel(hour * 60)}</span>
        ))}
      </div>
      {week.days.map((day) => (
        <div key={day.index} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", borderLeft: `1px solid ${ink.line}` }}>
          <span style={{ height: 18, fontSize: 10, lineHeight: "18px", fontWeight: 800, textAlign: "center", color: ink.text }}>{DAY_SHORT[day.index]}</span>
          <div
            style={{
              position: "relative",
              flex: 1,
              backgroundImage: `repeating-linear-gradient(180deg, transparent 0, transparent calc(${100 / hours.length}% - 1px), ${ink.ghost} calc(${100 / hours.length}% - 1px), ${ink.ghost} ${100 / hours.length}%)`,
            }}
          >
            {day.classes.map((item, i) => {
              const colors = block(item);
              return (
                <div
                  key={i}
                  style={{
                    ...timeBox(item, week, { x: 2, y: 2 }),
                    left: 2,
                    marginTop: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    padding: 5,
                    background: colors.bg,
                  }}
                >
                  <span style={{ ...ellipsis, fontSize: 9, lineHeight: "11px", fontWeight: 800, color: colors.text }}>{item.code}</span>
                  {settings.showVenue && item.room ? <span style={{ fontSize: 8, lineHeight: "10px", color: colors.sub }}>{item.room}</span> : null}
                  {settings.showTime ? <span style={{ fontSize: 8, lineHeight: "10px", color: colors.sub }}>{timeRange(item)}</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function DotsBody({ ctx, ink }: { ctx: Ctx; ink: Ink }) {
  const { week, settings } = ctx;
  const hours = Array.from({ length: week.endHour - week.startHour }, (_, i) => week.startHour + i);
  const dot = Math.min(22, Math.floor((303 - 36) / hours.length) - 6);
  const classAt = (day: WeekDay, hour: number) =>
    day.classes.find((item) => Math.min(item.end, (hour + 1) * 60) - Math.max(item.start, hour * 60) >= 30);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", paddingLeft: 36 }}>
        {hours.map((hour) => (
          <span key={hour} style={{ flex: 1, fontSize: 9, lineHeight: "11px", fontWeight: 600, textAlign: "center", color: ink.faint }}>{hourLabel(hour * 60)}</span>
        ))}
      </div>
      {week.days.map((day) => (
        <div key={day.index} style={{ display: "flex", alignItems: "center", height: 22 }}>
          <span style={{ width: 36, flexShrink: 0, fontSize: 10, fontWeight: 700, color: ink.sub }}>{DAY_SHORT[day.index]}</span>
          {hours.map((hour) => (
            <span key={hour} style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <span style={{ width: dot, height: dot, borderRadius: 99, background: classAt(day, hour)?.color ?? ink.ghost }} />
            </span>
          ))}
        </div>
      ))}
      <div style={{ display: "flex", flexDirection: "column", gap: 7, paddingTop: 12, borderTop: `1px solid ${ink.line}` }}>
        {week.subjects.map((item) => (
          <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, lineHeight: "13px" }}>
            <span style={{ width: 9, height: 9, borderRadius: 99, flexShrink: 0, background: item.color }} />
            <span style={{ fontWeight: 700, color: ink.text }}>{item.code}</span>
            <span style={{ ...ellipsis, flexGrow: 1, flexShrink: 1, color: ink.muted }}>{item.name}</span>
            {settings.showVenue && item.room ? <span style={{ ...ellipsis, maxWidth: "30%", color: ink.sub }}>{item.room}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function HeritageBody({ ctx, p, subSize, blockStyle }: { ctx: Ctx; p: HeritagePalette; subSize?: number; blockStyle?: CSSProperties }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <HeritageHead ctx={ctx} p={p} />
      <HeritageRule p={p} />
      <HeritageGrid ctx={ctx} p={p} subSize={subSize} blockStyle={blockStyle} />
    </div>
  );
}

const HERITAGE_IVORY: HeritagePalette = {
  gold: "#A87A1E",
  rule: "#A87A1E80",
  title: "#2A1045",
  fill: "#4A1D78",
  stroke: "#A87A1E",
  text: "#FFFFFF",
  sub: "#FFFFFFB3",
  crest: 0.1,
  foot: "#A87A1EB3",
};

/* ---------- designed styles built on the bodies ---------- */

function auroraGlass(ctx: Ctx) {
  return (
    <Column ctx={ctx} pad={[240, 18, 112]} gap={7}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px 4px" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF" }}>Weekly timetable</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: "#FFFFFFB3" }}>{ctx.week.classCount} classes</span>
      </div>
      <CardsBody ctx={ctx} ink={LIGHT_INK} />
    </Column>
  );
}

function pastelBento(ctx: Ctx) {
  return (
    <Column ctx={ctx} pad={[206, 16, 112]} gap={8}>
      <BentoBody ctx={ctx} />
    </Column>
  );
}

const SWISS_INK: Ink = { ...DARK_INK, text: "#111111", muted: "#11111199", line: "#1111111A", ghost: "#1111110F" };

function swissGrid(ctx: Ctx) {
  const first = ctx.week.days.find((day) => day.classes.length)?.classes[0];
  return (
    <Column ctx={ctx} pad={[232, 18, 112]} gap={10}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 6, borderBottom: "2px solid #E4002B" }}>
        <span style={{ fontSize: 26, lineHeight: "31px", fontWeight: 800, letterSpacing: -1, color: "#111111" }}>Timetable</span>
        <span style={{ fontSize: 10, fontWeight: 600, lineHeight: 1.2, textAlign: "right", color: "#111111" }}>
          Sesi
          <br />
          {ctx.session[0]}/{String(ctx.session[1]).slice(2)}
        </span>
      </div>
      <TimeGridBody ctx={ctx} ink={SWISS_INK} block={(item) => ({ bg: item === first ? "#E4002B" : "#111111", text: "#FFFFFF", sub: "#FFFFFFB3" })} />
    </Column>
  );
}

const DOT_INK: Ink = { ...LIGHT_INK, sub: "#FFFFFFB3", muted: "#FFFFFF80", ghost: "#FFFFFF12", line: "#FFFFFF1A" };

function dotMatrix(ctx: Ctx) {
  return (
    <Column ctx={ctx} pad={[244, 22, 112]} gap={14}>
      <DotsBody ctx={ctx} ink={DOT_INK} />
    </Column>
  );
}

export const WALLPAPER_STYLES: StyleDef[] = [
  { id: "paper-agenda", name: "Paper Agenda", lock: "#1E1A16", background: "#F3EEE6", render: paperAgenda },
  {
    id: "aurora-glass",
    name: "Aurora Glass",
    lock: "#FFFFFF",
    background:
      "radial-gradient(65% 40% at 85% 20%, #9353D3E6, #9353D300), radial-gradient(60% 35% at 10% 55%, #1D4ED8CC, #1D4ED800), radial-gradient(60% 30% at 80% 90%, #C0266DB3, #C0266D00), radial-gradient(50% 25% at 20% 5%, #3A1470, #3A147000), #12082A",
    render: auroraGlass,
  },
  { id: "heritage", name: "UiTM Heritage", lock: "#FFFFFF", background: "linear-gradient(180deg, #2A1045, #14061F)", render: heritage(HERITAGE) },
  { id: "pastel-bento", name: "Pastel Bento", lock: "#2A1B4A", background: "#EAE4F7", render: pastelBento },
  { id: "swiss-grid", name: "Swiss Grid", lock: "#111111", background: "#F4F4F0", render: swissGrid },
  { id: "dot-matrix", name: "Dot Matrix", lock: "#FFFFFF", background: "#0E0E12", render: dotMatrix },
  { id: "heritage-ivory", name: "Heritage Ivory", lock: "#2A1045", background: "linear-gradient(180deg, #FBF6EA, #EFE3C8)", render: heritage(HERITAGE_IVORY) },
  {
    id: "heritage-navy",
    name: "Crest Navy",
    lock: "#FFFFFF",
    background: "linear-gradient(180deg, #1C2167, #2B1A5E 50%, #5A1F7A)",
    render: heritage({ ...HERITAGE, fill: "#F2C230", text: "#1C2167", sub: "#1C2167B3", crest: 0.1 }),
  },
  {
    id: "heritage-noir",
    name: "Heritage Noir",
    lock: "#FFFFFF",
    background: "#0B0A0D",
    render: heritage({ gold: "#D4AF37", rule: "#D4AF3766", title: "#EDE3CC", fill: "transparent", stroke: "#D4AF37", text: "#EDE3CC", sub: "#F5E6C499", crest: 0.05, foot: "#D4AF3799" }),
  },
  {
    id: "heritage-songket",
    name: "Songket",
    lock: "#FFFFFF",
    background: "linear-gradient(180deg, #3A0F4A, #1A0624)",
    render: heritage({ ...HERITAGE, fill: "#C0266D26" }, "songket"),
  },
  { id: "heritage-almanac", name: "Almanac", lock: "#FFFFFF", background: "linear-gradient(180deg, #2A1045, #14061F)", render: heritage(HERITAGE, "almanac") },
];

export function getWallpaperStyle(id: StyleId): StyleDef {
  return WALLPAPER_STYLES.find((style) => style.id === id) ?? WALLPAPER_STYLES[0]!;
}

/* ---------- custom backgrounds: Colour and Photo ---------- */

/** Table layout drawn over a custom background. "grid" is the classic week grid (colour backgrounds only). */
export function getTableStyle(settings: WallpaperSettings): TableStyle {
  if (settings.backgroundMode !== "photo" || settings.tableStyle !== "grid") return settings.tableStyle;
  return settings.photoTreatment === "tint" ? "heritage" : "agenda";
}

/** Tables that bring their own heading, so no "This week" row is added above them. */
const OWN_HEAD: TableStyle[] = ["heritage", "bento"];

function TableBody({ ctx, ink, table, tint = false }: { ctx: Ctx; ink: Ink; table: TableStyle; tint?: boolean }) {
  switch (table) {
    case "cards":
      return <CardsBody ctx={ctx} ink={ink} />;
    case "timeline":
      return (
        <TimeGridBody
          ctx={ctx}
          ink={ink}
          block={(item) => (isDark(item.color) ? { bg: item.color, text: "#FFFFFF", sub: "#FFFFFFB3" } : { bg: item.color, text: "#11181C", sub: "#11181CB3" })}
        />
      );
    case "dots":
      return <DotsBody ctx={ctx} ink={ink} />;
    case "bento":
      return <BentoBody ctx={ctx} />;
    case "heritage":
      return tint ? (
        <HeritageBody
          ctx={ctx}
          p={{ ...HERITAGE, fill: "#14061F80", sub: "#F5E6C4B3" }}
          subSize={7}
          blockStyle={{ backdropFilter: `blur(${(ctx.settings.photoBlur * 0.2).toFixed(1)}px)` }}
        />
      ) : (
        <HeritageBody ctx={ctx} p={ink.dark ? HERITAGE_IVORY : HERITAGE} />
      );
    default:
      return <AgendaBody ctx={ctx} ink={ink} />;
  }
}

function colourInk(settings: WallpaperSettings): Ink {
  if (settings.themeId === "custom") return isDark(settings.customBackground ?? "#0F766E") ? LIGHT_INK : DARK_INK;
  return settings.themeId === "night" || settings.themeId === "gradient" ? LIGHT_INK : DARK_INK;
}

function colourTable(ctx: Ctx) {
  const table = getTableStyle(ctx.settings);
  const ink = colourInk(ctx.settings);
  return (
    <Column ctx={ctx} pad={[240, 18, 112]} gap={10}>
      {OWN_HEAD.includes(table) ? null : <TableHead ctx={ctx} ink={ink} />}
      <TableBody ctx={ctx} ink={ink} table={table} />
    </Column>
  );
}

function photoTextIsLight(settings: WallpaperSettings): boolean {
  if (settings.photoTextColor !== "auto") return settings.photoTextColor === "light";
  return settings.photo?.dark ?? true;
}

function photoGlass(ctx: Ctx) {
  const light = photoTextIsLight(ctx.settings);
  const ink = light ? LIGHT_INK : DARK_INK;
  const table = getTableStyle(ctx.settings);
  return (
    <Column ctx={ctx} pad={[236, 16, 112]} gap={0}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "14px 16px",
          borderRadius: 26,
          background: light ? "#FFFFFF26" : "#FFFFFF8C",
          border: `1px solid ${light ? "#FFFFFF4D" : "#FFFFFFB3"}`,
          backdropFilter: `blur(${(ctx.settings.photoBlur * 0.7).toFixed(1)}px)`,
          boxShadow: "0 10px 30px #0000002E",
        }}
      >
        {OWN_HEAD.includes(table) ? null : <TableHead ctx={ctx} ink={ink} />}
        <TableBody ctx={ctx} ink={ink} table={table} />
      </div>
    </Column>
  );
}

function photoScrim(ctx: Ctx) {
  const ink = photoTextIsLight(ctx.settings) ? LIGHT_INK : DARK_INK;
  const table = getTableStyle(ctx.settings);
  return (
    <div data-surface style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 8, height: "100%", padding: "0 22px 112px" }}>
      {OWN_HEAD.includes(table) ? null : <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: ink.sub }}>WEEKLY TIMETABLE</span>}
      <TableBody ctx={ctx} ink={ink} table={table} />
    </div>
  );
}

function photoTint(ctx: Ctx) {
  const table = getTableStyle(ctx.settings);
  return (
    <Column ctx={ctx} pad={[244, 20, 112]} gap={12}>
      {OWN_HEAD.includes(table) ? null : <TableHead ctx={ctx} ink={LIGHT_INK} />}
      <TableBody ctx={ctx} ink={LIGHT_INK} table={table} tint />
    </Column>
  );
}

function photoSplit(ctx: Ctx) {
  const table = getTableStyle(ctx.settings);
  return (
    <div data-surface style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%", padding: "336px 20px 112px" }}>
      <TableBody ctx={ctx} ink={DARK_INK} table={table} />
    </div>
  );
}

const PHOTO_RENDER = { glass: photoGlass, scrim: photoScrim, tint: photoTint, split: photoSplit };

function hasPhoto(settings: WallpaperSettings) {
  return settings.backgroundMode === "photo" && Boolean(settings.photo);
}

/** Whether the wallpaper is drawn by WallpaperCanvas rather than the classic week grid. */
export function usesWallpaperCanvas(settings: WallpaperSettings): boolean {
  if (settings.backgroundMode === "style") return true;
  if (settings.backgroundMode === "photo") return Boolean(settings.photo);
  return settings.tableStyle !== "grid";
}

/** How far the timetable can be dragged up or down, in % of wallpaper height. */
export const TABLE_OFFSET_LIMIT = 40;

/** Vertical nudge of the timetable in % of wallpaper height. Split keeps its table on the white panel. */
export function getTableOffset(settings: WallpaperSettings): number {
  return hasPhoto(settings) && settings.photoTreatment === "split" ? 0 : settings.tableOffset;
}

/** Lock-screen clock colour for the current background. */
export function getCanvasLockColor(settings: WallpaperSettings): string {
  if (settings.backgroundMode === "photo") {
    return settings.photoTreatment === "tint" || photoTextIsLight(settings) ? "#FFFFFF" : "#11181C";
  }
  if (settings.backgroundMode === "colour") return colourInk(settings).text;
  return getWallpaperStyle(settings.styleId).lock;
}

function PhotoLayers({ settings, scale }: { settings: WallpaperSettings; scale: number }) {
  const { photo, photoTreatment, photoDim, photoPositionY } = settings;
  const light = photoTextIsLight(settings);
  // Longhands only: mixing `inset` with `bottom`/`top` breaks React's style diff when the treatment changes.
  const fill: CSSProperties = { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 };
  const photoBox: CSSProperties = photoTreatment === "split" ? { ...fill, bottom: "56.2%" } : fill;
  return (
    <>
      <div
        style={{
          ...photoBox,
          backgroundImage: `url(${photo?.src})`,
          backgroundSize: "cover",
          backgroundPosition: `50% ${photoPositionY}%`,
        }}
      />
      <div style={{ ...photoBox, background: `rgba(0, 0, 0, ${photoDim / 100})` }} />
      {photoTreatment === "tint" ? (
        <>
          <div style={{ ...fill, background: "#8A4FD0", mixBlendMode: "multiply" }} />
          <div style={{ ...fill, background: "#2A104573" }} />
        </>
      ) : null}
      {photoTreatment === "scrim" ? (
        <div
          style={{
            ...fill,
            background: light
              ? "linear-gradient(180deg, #00000000 30%, #000000B3 62%, #000000E6 100%)"
              : "linear-gradient(180deg, #FFFFFF00 30%, #FFFFFFB3 62%, #FFFFFFE6 100%)",
          }}
        />
      ) : null}
      {photoTreatment === "split" ? (
        <div style={{ ...fill, top: "40.1%", background: "#FFFFFF", borderRadius: `${28 * scale}px ${28 * scale}px 0 0` }} />
      ) : null}
    </>
  );
}

/**
 * Full wallpaper surface for the Style, Photo and non-grid Colour backgrounds. The same node
 * renders the preview and the export, so the downloaded image matches what the user sees.
 */
export function WallpaperCanvas({ width, height, week, settings }: { width: number; height: number; week: Week; settings: WallpaperSettings }) {
  const scale = Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT);
  const isPhoto = hasPhoto(settings);
  const isColour = settings.backgroundMode === "colour";
  const style = getWallpaperStyle(settings.styleId);
  const ctx: Ctx = { week, settings, session: academicSession(), scale };
  const background = isPhoto
    ? "#111111"
    : isColour
      ? getThemePreset(settings.themeId, settings.customBackground).background
      : style.background;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        overflow: "hidden",
        background,
        fontFamily: SANS,
        textAlign: "left",
      }}
    >
      {isPhoto ? <PhotoLayers settings={settings} scale={scale} /> : null}
      <div
        data-surface
        style={{
          position: "absolute",
          top: 0,
          left: (width - CANVAS_WIDTH * scale) / 2,
          width: CANVAS_WIDTH,
          height: height / scale,
          // translateY % is of this box's own height, i.e. of the wallpaper height once scaled.
          transform: `scale(${scale}) translateY(${getTableOffset(settings)}%)`,
          transformOrigin: "top left",
        }}
      >
        {isPhoto ? PHOTO_RENDER[settings.photoTreatment](ctx) : isColour ? colourTable(ctx) : style.render(ctx)}
      </div>
    </div>
  );
}
