export const QColors = {
  primary: "#7C3AED",
  primaryLight: "#EDE9FE",
  primaryDark: "#5B21B6",
  accent: "#EC4899",
  accentLight: "#FCE7F3",
  gold: "#F59E0B",
  goldLight: "#FEF3C7",
  success: "#10B981",
  successLight: "#D1FAE5",
  error: "#EF4444",
  errorLight: "#FEE2E2",

  gradientStart: "#7C3AED",
  gradientMid: "#A855F7",
  gradientEnd: "#EC4899",

  light: {
    background: "#FFFFFF",
    backgroundSecondary: "#F9FAFB",
    backgroundTertiary: "#F3F4F6",
    text: "#111827",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",
    border: "#E5E7EB",
    card: "#FFFFFF",
    tabBar: "rgba(255,255,255,0.95)",
  },
  dark: {
    background: "#0A0A0F",
    backgroundSecondary: "#13131A",
    backgroundTertiary: "#1C1C28",
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    textTertiary: "#6B7280",
    border: "#2D2D3D",
    card: "#13131A",
    tabBar: "rgba(10,10,15,0.95)",
  },
};

export default {
  light: {
    text: QColors.light.text,
    background: QColors.light.background,
    tint: QColors.primary,
    tabIconDefault: QColors.light.textTertiary,
    tabIconSelected: QColors.primary,
  },
  dark: {
    text: QColors.dark.text,
    background: QColors.dark.background,
    tint: QColors.primary,
    tabIconDefault: QColors.dark.textTertiary,
    tabIconSelected: QColors.primary,
  },
};
