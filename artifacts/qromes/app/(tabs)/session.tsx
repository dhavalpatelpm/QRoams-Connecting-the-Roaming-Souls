import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QColors } from "@/constants/colors";
import { useTheme } from "@/constants/theme";
import { useChat, Conversation } from "@/context/ChatContext";

const AVATAR_COLORS: [string, string][] = [
  ["#7C3AED", "#EC4899"],
  ["#EC4899", "#F59E0B"],
  ["#10B981", "#3B82F6"],
  ["#F59E0B", "#EF4444"],
  ["#6366F1", "#8B5CF6"],
  ["#14B8A6", "#3B82F6"],
];

function getTimeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function ConvItem({ conv }: { conv: Conversation }) {
  const { colors } = useTheme();
  const grad = AVATAR_COLORS[parseInt(conv.participantId) % AVATAR_COLORS.length];
  return (
    <TouchableOpacity
      style={[styles.convRow, { borderBottomColor: colors.border }]}
      onPress={() => router.push({ pathname: "/chat/[id]", params: { id: conv.id } })}
      activeOpacity={0.75}
    >
      <View style={{ position: "relative" }}>
        <LinearGradient colors={grad} style={styles.avatar}>
          <Text style={styles.avatarText}>
            {conv.participantName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </Text>
        </LinearGradient>
        {conv.isOnline && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.convContent}>
        <View style={styles.convRow2}>
          <Text style={[styles.convName, { color: colors.text }]} numberOfLines={1}>
            {conv.participantName}
          </Text>
          <Text style={[styles.timeText, { color: colors.textTertiary }]}>
            {getTimeAgo(conv.lastMessageTime)}
          </Text>
        </View>
        <View style={styles.convRow2}>
          <Text
            style={[
              styles.lastMsg,
              { color: conv.unreadCount > 0 ? colors.text : colors.textSecondary },
              conv.unreadCount > 0 && { fontFamily: "Inter_600SemiBold" },
            ]}
            numberOfLines={1}
          >
            {conv.lastMessage}
          </Text>
          {conv.unreadCount > 0 && (
            <View style={styles.badge}>
              <LinearGradient
                colors={[QColors.primary, QColors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.badgeText}>{conv.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SessionScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { conversations } = useChat();
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.participantName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Sessions</Text>
        <TouchableOpacity style={styles.composeBtn}>
          <LinearGradient
            colors={[QColors.primary, QColors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="create-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: isDark ? colors.backgroundSecondary : "#F3F4F6" }]}>
        <Ionicons name="search" size={15} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search conversations..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={15} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <LinearGradient
            colors={[QColors.primary, QColors.accent]}
            style={styles.emptyIcon}
          >
            <Ionicons name="chatbubbles" size={36} color="#fff" />
          </LinearGradient>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No sessions yet</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Swipe down on a profile to start chatting
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => <ConvItem conv={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  composeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  convRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  onlineDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#10B981",
    position: "absolute",
    bottom: 1,
    right: 1,
    borderWidth: 2,
    borderColor: "#fff",
  },
  convContent: { flex: 1 },
  convRow2: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  convName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginLeft: 8,
  },
  lastMsg: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  emptySub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
