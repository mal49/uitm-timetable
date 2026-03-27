import { ImageResponse } from "next/og";
import { SocialPreviewCard } from "./social-preview";

export const alt = "UiTM Class Canvas preview card";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<SocialPreviewCard />, size);
}
