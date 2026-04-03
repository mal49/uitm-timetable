import type { ThemeId } from "../wallpaper-context";

export interface ThemePreset {
  id: ThemeId;
  name: string;
  description: string;
  background: string;
  lockscreenTextColor?: string;
  lockscreenTitleColor?: string;
  overlayBackground?: string;
  overlayTextColor?: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "ios-default",
    name: "iOS Default",
    description: "Warm lock screen with soft paper tones",
    background:
      "radial-gradient(circle at top, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0) 28%), linear-gradient(180deg, #ded7cb 0%, #d7cfbe 52%, #ccc3b2 100%)",
    lockscreenTextColor: "#ffffff",
    lockscreenTitleColor: "#ffffff",
    overlayBackground: "rgba(255, 255, 255, 0.95)",
    overlayTextColor: "#0f172a",
  },
  {
    id: "light",
    name: "Light & Clean",
    description: "Soft and minimal",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    lockscreenTextColor: "#0f172a",
    lockscreenTitleColor: "#1e293b",
    overlayBackground: "rgba(255, 255, 255, 0.95)",
    overlayTextColor: "#0f172a",
  },
  {
    id: "gradient",
    name: "Gradient Aurora",
    description: "Vibrant gradient",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    lockscreenTextColor: "#ffffff",
    lockscreenTitleColor: "#ffffff",
    overlayBackground: "rgba(255, 244, 250, 0.93)",
    overlayTextColor: "#4a1d46",
  },
  {
    id: "glass",
    name: "Glassmorphism",
    description: "Frosted glass effect",
    background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
    lockscreenTextColor: "#0f172a",
    lockscreenTitleColor: "#1e293b",
    overlayBackground: "rgba(255, 255, 255, 0.72)",
    overlayTextColor: "#162033",
  },
];

function normalizeHexColor(value?: string): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (/^#([a-f\d]{6})$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const shortHexMatch = trimmed.match(/^#([a-f\d]{3})$/i);
  if (!shortHexMatch) return null;

  const [, shortHex] = shortHexMatch;
  return `#${shortHex
    .split("")
    .map((char) => `${char}${char}`)
    .join("")
    .toUpperCase()}`;
}

function parseHexColor(hexColor: string): [number, number, number] {
  const normalized = normalizeHexColor(hexColor) ?? "#4F46E5";
  return [
    Number.parseInt(normalized.slice(1, 3), 16),
    Number.parseInt(normalized.slice(3, 5), 16),
    Number.parseInt(normalized.slice(5, 7), 16),
  ];
}

function rgbaFromHex(hexColor: string, alpha: number): string {
  const [r, g, b] = parseHexColor(hexColor);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mixWithWhite(hexColor: string, amount: number): string {
  const [r, g, b] = parseHexColor(hexColor);
  const mixChannel = (channel: number) =>
    Math.round(channel + (255 - channel) * amount)
      .toString(16)
      .padStart(2, "0");

  return `#${mixChannel(r)}${mixChannel(g)}${mixChannel(b)}`.toUpperCase();
}

function getBrightness(hexColor: string): number {
  const [r, g, b] = parseHexColor(hexColor);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function getReadableTextColor(hexColor: string): string {
  return getBrightness(hexColor) < 160 ? "#F8FAFC" : "#0F172A";
}

export function getThemePreset(
  id: ThemeId,
  customBackground?: string,
): ThemePreset {
  if (id === "custom") {
    const background = normalizeHexColor(customBackground) ?? "#0F766E";
    const textColor = getReadableTextColor(background);
    const darkText = "#0F172A";

    return {
      id: "custom",
      name: "Custom Color",
      description: "Personalized solid background",
      background,
      lockscreenTextColor: textColor,
      lockscreenTitleColor: textColor,
      overlayBackground:
        getBrightness(background) < 150
          ? rgbaFromHex(mixWithWhite(background, 0.12), 0.88)
          : rgbaFromHex(mixWithWhite(background, 0.82), 0.92),
      overlayTextColor: getBrightness(background) < 170 ? "#F8FAFC" : darkText,
    };
  }

  return THEME_PRESETS.find((t) => t.id === id) ?? THEME_PRESETS[0]!;
}
