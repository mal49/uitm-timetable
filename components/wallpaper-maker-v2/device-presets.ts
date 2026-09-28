/** The only export target: iPhone 15 Pro in portrait, 390 × 844 CSS px at 3× (1170 × 2532). */
export const EXPORT_DEVICE = {
  id: "iphone15pro",
  label: "iPhone 15 Pro",
  width: 390,
  height: 844,
  pixelRatio: 3,
  // Week-grid padding around the lock-screen clock and controls.
  paddingTop: "188px",
  paddingTopWithWidget: "252px",
  paddingBottom: "92px",
} as const;
