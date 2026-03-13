import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
import { useChat, Conversation } from "@/context/ChatContext";

const AVATAR_COLORS = [
  ["#7C3AED", "#EC4899"],
  ["#EC4899", "#F59E0B"],
  ["#10B981", "#3B82F6"],
  ["#F59E0B", "#EF4444"],
  ["#6366F1", "#8B5CF6"],
  ["#14B8A6", "#3B82F6"],
];

function ConversationItem({ conv }: { conv: Conversation }) {
  const { isDark, colors } = useTheme();
  const gradColors = AVATAR_COLORS[parseInt(conv.participantId) % AVATAR_COLORS.length] as [string, string];
  const timeAgo = getTimeAgo(conv.lastMessageTime);

  return (
    <TouchableOpacity
      style={[styles.convItem]}
      onPress={() => router.push({ pathname: "/chat/[id]", params: { id: conv.id } })}
      activeOpacity={0.8}
    >
      <View style={{ position: "relative" }}>
        <LinearGradient colors={[gradColors[0], gradColors[1]]} style={styles.avatar}>
          <Text style={styles.avatarText}>
            {conv.participantName.split(" ")[0][0]}
            {conv.participantName.split(" ")[1]?.[0] || ""}
          </Text>
        </LinearGradient>
        {conv.isOnline && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.convContent}>
        <View style={styles.convTopRow}>
          <Text style={[styles.convName, { color: colors.text }]}>
            {conv.participantName}
          </Text>
          <Text style={[styles.convTime, { color: colors.textTertiary }]}>{timeAgo}</Text>
        </View>
        <View style={styles.convBottomRow}>
          <Text
            style={[
              styles.convLastMsg,
              { color: conv.unreadCount > 0 ? colors.text : colors.textSecondary },
              conv.unreadCount > 0 && styles.convLastMsgUnread,
            ]}
            numberOfLines={1}
          >
            {conv.lastMessage}
          </Text>
          {conv.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <LinearGradient
                colors={[QColors.primary, QColors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.unreadCount}>{conv.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { conversations } = useChat();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.participantName.toLowerCase().includes(q);
    const matchTab = activeTab === "all" || c.unreadCount > 0;
    return matchSearch && matchTab;
  });

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
          {totalUnread > 0 && (
            <View style={styles.totalBadge}>
              <LinearGradient
                colors={[QColors.primary, QColors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.totalBadgeText}>{totalUnread}</Text>
            </View>
          )}
        </View>

        {/* Search */}
        <View style={[styles.searchRow, { backgroundColor: isDark ? colors.backgroundSecondary : "#F3F4F6" }]}>
          <Ionicons name="search" size={16} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search conversations..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(["all", "unread"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveTab(t)}
              style={[
                styles.tab,
                activeTab === t && styles.tabActive,
                activeTab === t && { borderBottomColor: QColors.primary },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === t ? QColors.primary : colors.textSecondary },
                ]}
              >
                {t === "all" ? "All Messages" : `Unread (${totalUnread})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => <ConversationItem conv={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100,
        }}
        contentInsetAdjustmentBehavior="automatic"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? colors.backgroundSecondary : "#F3F4F6" }]}>
              <Ionicons name="chatbubbles-outline" size={36} color={colors.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No conversations yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Swipe down on a profile to start chatting
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
    paddingBottom: 0,
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  totalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: "hidden",
  },
  totalBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
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
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    paddingBottom: 10,
    paddingHorizontal: 4,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {},
  tabText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  convItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
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
  convContent: {
    flex: 1,
    gap: 4,
  },
  convTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  convName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  convTime: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  convBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  convLastMsg: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  convLastMsgUnread: {
    fontFamily: "Inter_500Medium",
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    overflow: "hidden",
  },
  unreadCount: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
