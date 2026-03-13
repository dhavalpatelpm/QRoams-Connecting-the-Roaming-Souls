import { useColorScheme } from "react-native";
import { QColors } from "./colors";

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = isDark ? QColors.dark : QColors.light;
  return { isDark, colors, Q: QColors };
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  xxxxl: 64,
} as const;

export const Radius = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export const FontSize = {
  h1: 28,
  h2: 22,
  h3: 18,
  bodyLg: 16,
  body: 14,
  caption: 12,
  label: 11,
} as const;
