import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QColors } from "@/constants/colors";
import { useTheme } from "@/constants/theme";
import { useDiscover } from "@/context/DiscoverContext";

const AVATAR_COLORS = [
  ["#7C3AED", "#EC4899"],
  ["#EC4899", "#F59E0B"],
  ["#10B981", "#3B82F6"],
  ["#F59E0B", "#EF4444"],
  ["#6366F1", "#8B5CF6"],
  ["#14B8A6", "#3B82F6"],
];

type ConnectionType = "random" | "interest" | "nearby";

export default function SparkScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { profiles, likedProfiles } = useDiscover();
  const [isSearching, setIsSearching] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType>("random");
  const [coins, setCoins] = useState(100);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim1 = useRef(new Animated.Value(0)).current;
  const ringAnim2 = useRef(new Animated.Value(0)).current;
  const countAnim = useRef(new Animated.Value(0)).current;
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isSearching) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );

      const ring = (anim: Animated.Value) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 1800, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
          ])
        );

      pulse.start();
      ring(ringAnim1).start();
      setTimeout(() => ring(ringAnim2).start(), 600);

      let t = 30;
      setCountdown(t);
      const interval = setInterval(() => {
        t -= 1;
        setCountdown(t);
        if (t <= 0) {
          clearInterval(interval);
          setIsSearching(false);
          setCountdown(0);
          pulse.stop();
        }
      }, 1000);

      return () => {
        clearInterval(interval);
        pulse.stop();
        pulse.reset();
      };
    }
  }, [isSearching]);

  const handleSpark = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsSearching(true);
    setCoins((c) => c - 15);
  };

  const ringScale1 = ringAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });
  const ringOpacity1 = ringAnim1.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.5, 0.2, 0],
  });
  const ringScale2 = ringAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });
  const ringOpacity2 = ringAnim2.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.4, 0.1, 0],
  });

  const matches = profiles.filter((p) => likedProfiles.includes(p.id));
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Header */}
        <LinearGradient
          colors={[QColors.primaryDark, QColors.primary, QColors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: topPadding + 8 }]}
        >
          <Text style={styles.headerTitle}>Spark</Text>
          <Text style={styles.headerSub}>Find a random roaming soul instantly</Text>

          {/* Coins */}
          <View style={styles.coinsRow}>
            <Ionicons name="flash" size={16} color={QColors.gold} />
            <Text style={styles.coinsText}>{coins} coins</Text>
          </View>
        </LinearGradient>

        {/* Spark Button Area */}
        <View style={styles.sparkArea}>
          {/* Connection type selector */}
          <View style={[styles.typeSelector, { backgroundColor: isDark ? colors.backgroundSecondary : "#F3F4F6" }]}>
            {(["random", "interest", "nearby"] as ConnectionType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeBtn,
                  connectionType === t && styles.typeBtnActive,
                ]}
                onPress={() => setConnectionType(t)}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    { color: connectionType === t ? "#fff" : colors.textSecondary },
                  ]}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Pulsing button */}
          <View style={styles.sparkButtonContainer}>
            {isSearching && (
              <>
                <Animated.View
                  style={[
                    styles.ring,
                    {
                      transform: [{ scale: ringScale1 }],
                      opacity: ringOpacity1,
                      backgroundColor: QColors.primary,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.ring,
                    {
                      transform: [{ scale: ringScale2 }],
                      opacity: ringOpacity2,
                      backgroundColor: QColors.accent,
                    },
                  ]}
                />
              </>
            )}

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                onPress={isSearching ? () => setIsSearching(false) : handleSpark}
                style={styles.sparkButtonOuter}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={
                    isSearching
                      ? ["#6B7280", "#4B5563"]
                      : [QColors.primary, QColors.accent]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sparkButtonGradient}
                >
                  {isSearching ? (
                    <>
                      <Ionicons name="close" size={32} color="#fff" />
                      <Text style={styles.sparkBtnLabel}>Cancel</Text>
                      <Text style={styles.countdown}>{countdown}s</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="flash" size={36} color="#fff" />
                      <Text style={styles.sparkBtnLabel}>SPARK!</Text>
                      <Text style={styles.sparkCost}>15 coins</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {isSearching ? (
            <View style={styles.searchingInfo}>
              <View style={styles.searchingDots}>
                <SearchingDots />
              </View>
              <Text style={[styles.searchingText, { color: colors.textSecondary }]}>
                Searching for roaming souls
              </Text>
            </View>
          ) : (
            <Text style={[styles.sparkDesc, { color: colors.textSecondary }]}>
              Get matched instantly with a random soul anywhere in the world. Tap to start!
            </Text>
          )}
        </View>

        {/* Coin packages */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Coin Packs</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {[
              { coins: 50, price: "$0.99", bonus: "" },
              { coins: 150, price: "$1.99", bonus: "Best Value" },
              { coins: 500, price: "$4.99", bonus: "Popular" },
              { coins: 1200, price: "$9.99", bonus: "Best Deal" },
            ].map((pack) => (
              <TouchableOpacity
                key={pack.coins}
                style={[styles.packCard, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}
              >
                {pack.bonus && (
                  <View style={styles.packBadge}>
                    <LinearGradient
                      colors={[QColors.gold, "#F97316"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.packBadgeText}>{pack.bonus}</Text>
                  </View>
                )}
                <Ionicons name="flash" size={24} color={QColors.gold} />
                <Text style={[styles.packCoins, { color: colors.text }]}>{pack.coins}</Text>
                <Text style={[styles.packCoinsLabel, { color: colors.textSecondary }]}>coins</Text>
                <View style={[styles.packPriceBtn, { backgroundColor: QColors.primary }]}>
                  <Text style={styles.packPrice}>{pack.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Matches */}
        {matches.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Connections</Text>
            {matches.map((p) => {
              const gradColors = AVATAR_COLORS[parseInt(p.id) % AVATAR_COLORS.length] as [string, string];
              return (
                <View key={p.id} style={[styles.matchCard, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
                  <LinearGradient colors={[gradColors[0], gradColors[1]]} style={styles.matchAvatar}>
                    <Text style={styles.matchAvatarText}>{p.firstName[0]}{p.lastName[0]}</Text>
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.matchName, { color: colors.text }]}>
                      {p.firstName}, {p.age}
                    </Text>
                    <Text style={[styles.matchLocation, { color: colors.textSecondary }]}>
                      {p.city}, {p.country}
                    </Text>
                  </View>
                  <TouchableOpacity style={[styles.matchBtn, { backgroundColor: QColors.primary }]}>
                    <Ionicons name="chatbubble" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function SearchingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (d: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(d, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      ).start();

    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {[dot1, dot2, dot3].map((d, i) => (
        <Animated.View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: QColors.primary, opacity: d }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  headerSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
  },
  coinsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
  },
  coinsText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  sparkArea: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 20,
  },
  typeSelector: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
  },
  typeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  typeBtnActive: {
    backgroundColor: QColors.primary,
  },
  typeBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  sparkButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 160,
    height: 160,
  },
  ring: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  sparkButtonOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    shadowColor: QColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  sparkButtonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  sparkBtnLabel: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  sparkCost: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  countdown: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  searchingInfo: {
    alignItems: "center",
    gap: 8,
  },
  searchingDots: {
    flexDirection: "row",
  },
  searchingText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  sparkDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  packCard: {
    width: 110,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 6,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  packBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: "hidden",
  },
  packBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
  },
  packCoins: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  packCoinsLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  packPriceBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 4,
  },
  packPrice: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  matchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
  },
  matchAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  matchAvatarText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  matchName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  matchLocation: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  matchBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
