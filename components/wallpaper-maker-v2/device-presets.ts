"use client";

import type { LayoutStyle } from "./wallpaper-context";

export type WallpaperDeviceId = "iphone15pro" | "ipadair5";
export type DeviceOrientation = "portrait" | "landscape";
export type DeviceKind = "phone" | "tablet";

type ScreenInset = {
  top: string;
  left: string;
  right: string;
  bottom: string;
};

type PreviewMetrics = {
  maxWidthPx: number;
  imageWidth: number;
  imageHeight: number;
  screenInset: ScreenInset;
  screenRadius: string;
  statusTop: string;
  statusPaddingX: string;
  statusTextClassName: string;
  lockTop: string;
  lockDateClassName: string;
  lockTimeClassName: string;
  widgetTop: string;
  widgetLabel: string;
  footerBottom: string;
  footerPaddingX: string;
  footerIconSizeClassName: string;
  homeIndicatorBottom: string;
  homeIndicatorWidthClassName: string;
};

type ExportMetrics = {
  width: number;
  height: number;
  pixelRatio: number;
  paddingTop: string;
  paddingTopWithWidget: string;
  paddingBottom: string;
  paddingLeft: string;
};

export type DevicePreset = {
  id: WallpaperDeviceId;
  label: string;
  kind: DeviceKind;
  preview: Record<DeviceOrientation, PreviewMetrics>;
  export: Record<DeviceOrientation, ExportMetrics>;
};

export const DEVICE_PRESETS: DevicePreset[] = [
  {
    id: "iphone15pro",
    label: "iPhone 15 Pro",
    kind: "phone",
    preview: {
      portrait: {
        maxWidthPx: 360,
        imageWidth: 360,
        imageHeight: 780,
        screenInset: {
          top: "3.2%",
          left: "5.1%",
          right: "5.1%",
          bottom: "3.2%",
        },
        screenRadius: "42px",
        statusTop: "0px",
        statusPaddingX: "24px",
        statusTextClassName:
          "flex items-center justify-between text-[10px] font-medium tracking-[0.02em]",
        lockTop: "98px",
        lockDateClassName:
          "text-[13px] font-medium tracking-[0.01em] opacity-90",
        lockTimeClassName:
          "mt-1 text-[60px] font-semibold leading-none tracking-[-0.06em]",
        widgetTop: "160px",
        widgetLabel: "Widget Position",
        footerBottom: "36px",
        footerPaddingX: "28px",
        footerIconSizeClassName: "h-10 w-10",
        homeIndicatorBottom: "12px",
        homeIndicatorWidthClassName: "w-28",
      },
      landscape: {
        maxWidthPx: 520,
        imageWidth: 520,
        imageHeight: 260,
        screenInset: {
          top: "5.8%",
          left: "2.8%",
          right: "2.8%",
          bottom: "5.8%",
        },
        screenRadius: "24px",
        statusTop: "0px",
        statusPaddingX: "20px",
        statusTextClassName:
          "flex items-center justify-between text-[9px] font-medium tracking-[0.02em]",
        lockTop: "0px",
        lockDateClassName: "text-[9px] font-medium opacity-90",
        lockTimeClassName:
          "text-[28px] font-semibold leading-none tracking-[-0.05em]",
        widgetTop: "34px",
        widgetLabel: "Widget",
        footerBottom: "0px",
        footerPaddingX: "0px",
        footerIconSizeClassName: "h-0 w-0",
        homeIndicatorBottom: "0px",
        homeIndicatorWidthClassName: "w-0",
      },
    },
    export: {
      portrait: {
        width: 390,
        height: 844,
        pixelRatio: 3,
        paddingTop: "188px",
        paddingTopWithWidget: "252px",
        paddingBottom: "92px",
        paddingLeft: "0px",
      },
      landscape: {
        width: 844,
        height: 390,
        pixelRatio: 3,
        paddingTop: "42px",
        paddingTopWithWidget: "58px",
        paddingBottom: "16px",
        paddingLeft: "10px",
      },
    },
  },
  {
    id: "ipadair5",
    label: "iPad Air 5",
    kind: "tablet",
    preview: {
      portrait: {
        maxWidthPx: 420,
        imageWidth: 420,
        imageHeight: 577,
        screenInset: {
          top: "4.1%",
          left: "5.2%",
          right: "5.2%",
          bottom: "4.1%",
        },
        screenRadius: "28px",
        statusTop: "0px",
        statusPaddingX: "28px",
        statusTextClassName:
          "flex items-center justify-between text-[11px] font-medium tracking-[0.02em]",
        lockTop: "82px",
        lockDateClassName:
          "text-[14px] font-medium tracking-[0.01em] opacity-90",
        lockTimeClassName:
          "mt-1 text-[70px] font-semibold leading-none tracking-[-0.05em]",
        widgetTop: "178px",
        widgetLabel: "Widget Position",
        footerBottom: "34px",
        footerPaddingX: "30px",
        footerIconSizeClassName: "h-11 w-11",
        homeIndicatorBottom: "14px",
        homeIndicatorWidthClassName: "w-32",
      },
      landscape: {
        maxWidthPx: 640,
        imageWidth: 640,
        imageHeight: 465,
        screenInset: {
          top: "5.2%",
          left: "4.0%",
          right: "4.0%",
          bottom: "5.2%",
        },
        screenRadius: "24px",
        statusTop: "0px",
        statusPaddingX: "24px",
        statusTextClassName:
          "flex items-center justify-between text-[10px] font-medium tracking-[0.02em]",
        lockTop: "10px",
        lockDateClassName: "text-[11px] font-medium opacity-90",
        lockTimeClassName:
          "text-[38px] font-semibold leading-none tracking-[-0.05em]",
        widgetTop: "48px",
        widgetLabel: "Widget",
        footerBottom: "0px",
        footerPaddingX: "0px",
        footerIconSizeClassName: "h-0 w-0",
        homeIndicatorBottom: "0px",
        homeIndicatorWidthClassName: "w-0",
      },
    },
    export: {
      portrait: {
        width: 820,
        height: 1180,
        pixelRatio: 2,
        paddingTop: "168px",
        paddingTopWithWidget: "168px",
        paddingBottom: "72px",
        paddingLeft: "0px",
      },
      landscape: {
        width: 1180,
        height: 820,
        pixelRatio: 2,
        paddingTop: "132px",
        paddingTopWithWidget: "132px",
        paddingBottom: "48px",
        paddingLeft: "24px",
      },
    },
  },
];

export function getDevicePreset(deviceId: string): DevicePreset {
  return DEVICE_PRESETS.find((device) => device.id === deviceId) ?? DEVICE_PRESETS[0]!;
}

export function getLandscapeRightPadding(
  layoutStyle: LayoutStyle,
  deviceKind: DeviceKind
): string {
  const phonePadding: Record<LayoutStyle, string> = {
    "wallpaper-table": "24px",
  };

  const tabletPadding: Record<LayoutStyle, string> = {
    "wallpaper-table": "22px",
  };

  return (deviceKind === "tablet" ? tabletPadding : phonePadding)[layoutStyle];
}
