import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QColors } from "@/constants/colors";
import { useTheme } from "@/constants/theme";
import { ProfileCard as ProfileCardType } from "@/context/DiscoverContext";
import { useDiscover } from "@/context/DiscoverContext";

const FILTERS = ["All", "Online", "Nearby", "New", "Verified"];
const COUNTRIES = ["Global", "India", "USA", "UK", "Japan", "Brazil", "Kenya", "Spain"];

const AVATAR_COLORS = [
  ["#7C3AED", "#EC4899"],
  ["#EC4899", "#F59E0B"],
  ["#10B981", "#3B82F6"],
  ["#F59E0B", "#EF4444"],
  ["#6366F1", "#8B5CF6"],
  ["#14B8A6", "#3B82F6"],
];

function ExploreCard({ profile }: { profile: ProfileCardType }) {
  const { isDark, colors } = useTheme();
  const gradColors = AVATAR_COLORS[parseInt(profile.id) % AVATAR_COLORS.length] as [string, string];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={[gradColors[0], gradColors[1]]}
        style={styles.avatar}
      >
        <Text style={styles.avatarText}>
          {profile.firstName[0]}{profile.lastName[0]}
        </Text>
        {profile.isOnline && <View style={styles.onlineDot} />}
      </LinearGradient>

      <View style={styles.cardInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text }]}>
            {profile.firstName}, {profile.age}
          </Text>
          {profile.isOnline && (
            <View style={styles.onlineBadge}>
              <Text style={styles.onlineBadgeText}>Online</Text>
            </View>
          )}
        </View>
        <Text style={[styles.location, { color: colors.textSecondary }]}>
          {profile.city}, {profile.country}
        </Text>
        <Text style={[styles.bio, { color: colors.textTertiary }]} numberOfLines={2}>
          {profile.bio}
        </Text>
        <View style={styles.interests}>
          {profile.interests.slice(0, 2).map((i) => (
            <View key={i} style={[styles.chip, { backgroundColor: QColors.primaryLight }]}>
              <Text style={[styles.chipText, { color: QColors.primary }]}>{i}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: QColors.primaryLight }]}>
          <Ionicons name="chatbubble" size={16} color={QColors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#10B98115" }]}>
          <Ionicons name="videocam" size={16} color="#10B981" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { profiles } = useDiscover();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeCountry, setActiveCountry] = useState("Global");

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.firstName.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.interests.some((i) => i.toLowerCase().includes(q));
    const matchFilter =
      activeFilter === "All" ||
      (activeFilter === "Online" && p.isOnline) ||
      activeFilter === "New" ||
      activeFilter === "Nearby";
    const matchCountry =
      activeCountry === "Global" ||
      p.country.toLowerCase().includes(activeCountry.toLowerCase());
    return matchSearch && matchFilter && matchCountry;
  });

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Explore</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Find your Q-Connection
        </Text>

        {/* Search */}
        <View style={[styles.searchRow, { backgroundColor: isDark ? colors.backgroundSecondary : "#F3F4F6" }]}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by name, city, interests..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <ExploreCard profile={item} />}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100, paddingTop: 8 }}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            {/* Filters */}
            <FlatList
              data={FILTERS}
              keyExtractor={(f) => f}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
              renderItem={({ item: f }) => (
                <TouchableOpacity
                  onPress={() => setActiveFilter(f)}
                  style={[
                    styles.filterChip,
                    activeFilter === f && styles.filterChipActive,
                    { backgroundColor: activeFilter === f ? QColors.primary : isDark ? colors.backgroundSecondary : "#F3F4F6" },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: activeFilter === f ? "#fff" : colors.textSecondary },
                    ]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* Country filter */}
            <FlatList
              data={COUNTRIES}
              keyExtractor={(c) => c}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
              renderItem={({ item: c }) => (
                <TouchableOpacity
                  onPress={() => setActiveCountry(c)}
                  style={[
                    styles.countryChip,
                    activeCountry === c && { borderColor: QColors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.countryText,
                      { color: activeCountry === c ? QColors.primary : colors.textSecondary },
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
              {filtered.length} roaming souls found
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={40} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No souls found
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  filterChipActive: {},
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  countryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  countryText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  resultsCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.9)",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#fff",
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  onlineBadge: {
    backgroundColor: "#10B98120",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  onlineBadgeText: {
    color: "#10B981",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  location: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  bio: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  interests: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  cardActions: {
    gap: 8,
    justifyContent: "center",
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
});
