import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { QColors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { QRoamsLogo } from "@/components/QRoamsLogo";

const { height: SCREEN_H } = Dimensions.get("window");

export default function SplashPage() {
  const { isLoading, isOnboarded, user } = useAuth();
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        delay: 200,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );

    pulse(dot1, 0).start();
    pulse(dot2, 200).start();
    pulse(dot3, 400).start();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (user && isOnboarded) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isLoading, user, isOnboarded]);

  return (
    <LinearGradient
      colors={[QColors.primaryDark, QColors.primary, QColors.accent]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.container}
    >
      <Animated.View
        style={{
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
          alignItems: "center",
        }}
      >
        <QRoamsLogo size={100} />
        <Text style={styles.appName}>QRoams</Text>
        <Text style={styles.tagline}>CONNECTING THE ROAMING SOULS</Text>
      </Animated.View>

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circleTopRight]} />
      <View style={[styles.circle, styles.circleBottomLeft]} />

      <View style={styles.dots}>
        <Animated.View style={[styles.dot, { opacity: dot1 }]} />
        <Animated.View style={[styles.dot, { opacity: dot2 }]} />
        <Animated.View style={[styles.dot, { opacity: dot3 }]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 42,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginTop: 16,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 2.5,
    marginTop: 8,
  },
  dots: {
    position: "absolute",
    bottom: 60,
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  circle: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  circleTopRight: {
    top: -80,
    right: -80,
  },
  circleBottomLeft: {
    bottom: -80,
    left: -80,
  },
});
