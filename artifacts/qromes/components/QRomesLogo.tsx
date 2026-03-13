import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { QColors } from "@/constants/colors";

type Props = {
  size?: number;
  showText?: boolean;
  textColor?: string;
  variant?: "full" | "icon";
};

export function QRomesLogo({
  size = 64,
  showText = false,
  textColor = "#fff",
  variant = "icon",
}: Props) {
  const iconSize = size;

  return (
    <View style={styles.container}>
      <Svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
      >
        <Defs>
          <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={QColors.primary} />
            <Stop offset="100%" stopColor={QColors.accent} />
          </LinearGradient>
          <LinearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#9333EA" />
            <Stop offset="100%" stopColor="#EC4899" />
          </LinearGradient>
        </Defs>

        {/* Background rounded square */}
        <Path
          d="M15,0 L85,0 Q100,0 100,15 L100,85 Q100,100 85,100 L15,100 Q0,100 0,85 L0,15 Q0,0 15,0"
          fill="url(#bgGrad)"
        />

        {/* Magnifying glass circle */}
        <Circle
          cx="43"
          cy="43"
          r="24"
          fill="none"
          stroke="white"
          strokeWidth="8"
        />

        {/* Magnifying glass handle */}
        <Line
          x1="60"
          y1="60"
          x2="78"
          y2="78"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Two soul dots */}
        <Circle cx="30" cy="72" r="4" fill="#C084FC" opacity="0.9" />
        <Circle cx="70" cy="72" r="4" fill="#F472B6" opacity="0.9" />

        {/* Dashed arc connecting the dots */}
        <Path
          d="M30,72 Q50,58 70,72"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeDasharray="4,3"
          opacity="0.7"
        />

        {/* Heart at midpoint */}
        <Path
          d="M50,61 C50,61 47,57.5 47,55.5 C47,53.5 48.5,52 50,53.5 C51.5,52 53,53.5 53,55.5 C53,57.5 50,61 50,61 Z"
          fill="#F87171"
        />
      </Svg>

      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.appName, { color: textColor }]}>QRomes</Text>
          <Text style={[styles.tagline, { color: textColor }]}>
            CONNECTING THE ROAMING SOULS
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  textContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  appName: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 2,
    marginTop: 4,
    opacity: 0.75,
  },
});
