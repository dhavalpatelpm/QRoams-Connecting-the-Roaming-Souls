import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QColors } from "@/constants/colors";
import { useTheme } from "@/constants/theme";
import { useDiscover } from "@/context/DiscoverContext";

const MEET_CATEGORIES = [
  {
    id: "coffee",
    emoji: "☕",
    title: "Coffee Date",
    subtitle: "Casual & cozy",
    color: "#FEF9C3",
    colorDark: "#2D2A00",
    accent: "#D97706",
  },
  {
    id: "dinner",
    emoji: "🍽️",
    title: "Dinner Date",
    subtitle: "Elevate it",
    color: "#FCE7F3",
    colorDark: "#2D001A",
    accent: "#EC4899",
  },
  {
    id: "walk",
    emoji: "🌿",
    title: "Park Walk",
    subtitle: "Easy & relaxed",
    color: "#D1FAE5",
    colorDark: "#00200E",
    accent: "#10B981",
  },
  {
    id: "activity",
    emoji: "🎯",
    title: "Activity",
    subtitle: "Fun & memorable",
    color: "#EDE9FE",
    colorDark: "#1A0040",
    accent: "#7C3AED",
  },
];

const AVATAR_EMOJIS = ["🌸", "🌺", "🌻", "🌹", "🦋", "🌙", "⭐", "🌊"];
const AVATAR_COLORS: [string, string][] = [
  ["#EDE9FE", "#DDD6FE"],
  ["#FCE7F3", "#FBCFE8"],
  ["#FEF9C3", "#FEF08A"],
  ["#D1FAE5", "#A7F3D0"],
];

export default function MeetScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { profiles } = useDiscover();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [proposedIds, setProposedIds] = useState<Set<string>>(new Set());

  const mutualConnections = profiles.slice(0, 5).map((p, i) => ({
    ...p,
    distance: `${(0.5 + i * 0.7 + Math.random()).toFixed(1)} km`,
    common: Math.floor(2 + Math.random() * 5),
    emoji: AVATAR_EMOJIS[i % AVATAR_EMOJIS.length],
    bgColors: AVATAR_COLORS[i % AVATAR_COLORS.length],
  }));

  const handleProposeMeet = (id: string, name: string) => {
    if (proposedIds.has(id)) return;
    Alert.alert(
      "Propose Meet 🤝",
      `Send ${name} a meet request${selectedCategory ? ` for a ${MEET_CATEGORIES.find((c) => c.id === selectedCategory)?.title}` : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Request",
          onPress: () => {
            setProposedIds((prev) => new Set([...prev, id]));
            Alert.alert("Sent! 🎉", `Your meet request was sent to ${name}.`);
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Meet Up</Text>
            <Text style={{ fontSize: 22 }}>🤝</Text>
          </View>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            Real connections, real world
          </Text>
        </View>
      </View>

      {/* Meet Categories */}
      <View style={styles.categoryGrid}>
        {MEET_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryCard,
              {
                backgroundColor: isDark ? cat.colorDark : cat.color,
                borderWidth: selectedCategory === cat.id ? 2 : 0,
                borderColor: cat.accent,
              },
            ]}
            onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            activeOpacity={0.82}
          >
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text style={[styles.categoryTitle, { color: isDark ? "#F9FAFB" : "#111827" }]}>
              {cat.title}
            </Text>
            <Text style={[styles.categorySub, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>
              {cat.subtitle}
            </Text>
            {selectedCategory === cat.id && (
              <View style={[styles.selectedBadge, { backgroundColor: cat.accent }]}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Mutual Connections */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your Mutual Connections
        </Text>
        {selectedCategory && (
          <View style={[styles.filterBadge, { backgroundColor: QColors.primaryLight }]}>
            <Text style={[styles.filterBadgeText, { color: QColors.primary }]}>
              {MEET_CATEGORIES.find((c) => c.id === selectedCategory)?.title}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.connectionsGrid}>
        {mutualConnections.map((person, idx) => (
          <View
            key={person.id}
            style={[
              styles.connectionCard,
              { backgroundColor: isDark ? colors.backgroundSecondary : "#F5F3FF" },
            ]}
          >
            <View style={[styles.connectionAvatar, { backgroundColor: isDark ? "#2D2040" : person.bgColors[0] }]}>
              <Text style={styles.connectionEmoji}>{person.emoji}</Text>
            </View>
            <Text style={[styles.connectionName, { color: colors.text }]}>
              {person.firstName}, {person.age}
            </Text>
            <View style={styles.connectionMeta}>
              <Ionicons name="location" size={11} color={QColors.primary} />
              <Text style={[styles.connectionMetaText, { color: colors.textSecondary }]}>
                {person.distance} · {person.common} common
              </Text>
            </View>
            {proposedIds.has(person.id) ? (
              <View style={[styles.proposeBtn, { backgroundColor: "#E5E7EB" }]}>
                <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                <Text style={[styles.proposeBtnText, { color: "#6B7280" }]}>Proposed</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.proposeBtn}
                onPress={() => handleProposeMeet(person.id, person.firstName)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[QColors.primary, QColors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.proposeBtnText}>Propose Meet</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Empty slot */}
        <View
          style={[
            styles.connectionCard,
            styles.emptySlot,
            { borderColor: isDark ? colors.border : "#E5E7EB" },
          ]}
        >
          <Text style={styles.emptySlotEmoji}>❤️</Text>
          <Text style={[styles.emptySlotText, { color: colors.textTertiary }]}>
            Like more people to grow your matches!
          </Text>
        </View>
      </View>

      {/* Tips */}
      <View style={styles.tipsSection}>
        <Text style={[styles.tipsTitle, { color: colors.textSecondary }]}>MEET TIPS</Text>
        {[
          { icon: "shield-checkmark-outline", text: "Always meet in a public place first" },
          { icon: "time-outline", text: "Keep first meets short — 30–60 mins" },
          { icon: "phone-portrait-outline", text: "Share your live location with a friend" },
        ].map((tip, i) => (
          <View key={i} style={[styles.tipRow, { borderBottomColor: colors.border }]}>
            <View style={styles.tipIconBox}>
              <Ionicons name={tip.icon as any} size={16} color={QColors.primary} />
            </View>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  headerSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 24,
  },
  categoryCard: {
    width: "47%",
    borderRadius: 16,
    padding: 16,
    position: "relative",
    overflow: "hidden",
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  categorySub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  selectedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  filterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  filterBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  connectionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 28,
  },
  connectionCard: {
    width: "47%",
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  connectionAvatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  connectionEmoji: {
    fontSize: 36,
  },
  connectionName: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  connectionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  connectionMetaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  proposeBtn: {
    width: "100%",
    paddingVertical: 9,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  proposeBtnText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  emptySlot: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 20,
    minHeight: 160,
  },
  emptySlotEmoji: {
    fontSize: 28,
  },
  emptySlotText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 17,
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tipIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: QColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  tipText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
});
