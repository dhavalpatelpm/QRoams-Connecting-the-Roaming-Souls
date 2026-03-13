import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
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
  ["#EC4899", "#6366F1"],
  ["#F59E0B", "#10B981"],
];

type SessionTab = "chat" | "audio" | "video" | "meet" | "proposed";

type SessionItem = {
  id: string;
  name: string;
  age: number;
  city: string;
  country: string;
  isOnline: boolean;
  time: number;
  lastMessage?: string;
  unread?: number;
  duration?: string;
  callStatus?: "completed" | "missed";
  meetDate?: string;
  meetPlace?: string;
  proposedBy?: string;
};

const MOCK_AUDIO: SessionItem[] = [
  { id: "a1", name: "Sofia M.", age: 24, city: "Barcelona", country: "Spain", isOnline: true, time: Date.now() - 3600000, duration: "12:34", callStatus: "completed" },
  { id: "a2", name: "Priya K.", age: 27, city: "Mumbai", country: "India", isOnline: false, time: Date.now() - 86400000, duration: "4:18", callStatus: "missed" },
  { id: "a3", name: "Aiko T.", age: 23, city: "Tokyo", country: "Japan", isOnline: true, time: Date.now() - 172800000, duration: "22:05", callStatus: "completed" },
  { id: "a4", name: "Lena H.", age: 26, city: "Berlin", country: "Germany", isOnline: false, time: Date.now() - 259200000, duration: "8:47", callStatus: "completed" },
];

const MOCK_VIDEO: SessionItem[] = [
  { id: "v1", name: "Camille D.", age: 25, city: "Paris", country: "France", isOnline: true, time: Date.now() - 7200000, duration: "18:22", callStatus: "completed" },
  { id: "v2", name: "Zara A.", age: 28, city: "Dubai", country: "UAE", isOnline: true, time: Date.now() - 43200000, duration: "6:51", callStatus: "completed" },
  { id: "v3", name: "Maya R.", age: 22, city: "Lagos", country: "Nigeria", isOnline: false, time: Date.now() - 108000000, duration: "0:00", callStatus: "missed" },
];

const MOCK_MEET: SessionItem[] = [
  { id: "m1", name: "Isabella F.", age: 26, city: "Rome", country: "Italy", isOnline: true, time: Date.now() + 86400000, meetDate: "Tomorrow, 5:00 PM", meetPlace: "Piazza Navona" },
  { id: "m2", name: "Hana N.", age: 24, city: "Seoul", country: "South Korea", isOnline: false, time: Date.now() + 172800000, meetDate: "Sat, 3:00 PM", meetPlace: "Gyeongbokgung" },
  { id: "m3", name: "Nina P.", age: 29, city: "Prague", country: "Czech", isOnline: true, time: Date.now() + 259200000, meetDate: "Sun, 12:00 PM", meetPlace: "Old Town Square" },
];

const MOCK_PROPOSED: SessionItem[] = [
  { id: "p1", name: "Emma L.", age: 25, city: "London", country: "UK", isOnline: true, time: Date.now() - 1800000, proposedBy: "them" },
  { id: "p2", name: "Aria S.", age: 23, city: "New York", country: "USA", isOnline: false, time: Date.now() - 3600000, proposedBy: "you" },
  { id: "p3", name: "Yuki M.", age: 27, city: "Osaka", country: "Japan", isOnline: true, time: Date.now() - 7200000, proposedBy: "them" },
  { id: "p4", name: "Layla M.", age: 24, city: "Cairo", country: "Egypt", isOnline: false, time: Date.now() - 18000000, proposedBy: "you" },
];

function getTimeAgo(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 0) {
    const future = -diff;
    const h = Math.floor(future / 3600000);
    if (h < 24) return `in ${h}h`;
    return `in ${Math.floor(h / 24)}d`;
  }
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function Avatar({ name, index, isOnline, size = 54 }: { name: string; index: number; isOnline: boolean; size?: number }) {
  const grad = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <View style={{ position: "relative" }}>
      <LinearGradient colors={grad} style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#fff", fontSize: size * 0.33, fontFamily: "Inter_700Bold" }}>{initials}</Text>
      </LinearGradient>
      {isOnline && (
        <View style={[stA.onlineDot, { width: size * 0.24, height: size * 0.24, borderRadius: size * 0.12, bottom: 1, right: 1 }]} />
      )}
    </View>
  );
}
const stA = StyleSheet.create({
  onlineDot: {
    backgroundColor: "#10B981",
    position: "absolute",
    borderWidth: 2,
    borderColor: "#fff",
  },
});

function ChatItem({ conv, index }: { conv: Conversation; index: number }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={() => router.push({ pathname: "/chat/[id]", params: { id: conv.id } })}
      activeOpacity={0.75}
    >
      <Avatar name={conv.participantName} index={index} isOnline={conv.isOnline} />
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowName, { color: colors.text }]} numberOfLines={1}>{conv.participantName}</Text>
          <Text style={[styles.rowTime, { color: colors.textTertiary }]}>{getTimeAgo(conv.lastMessageTime)}</Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={[styles.rowSub, { color: conv.unreadCount > 0 ? colors.text : colors.textSecondary }, conv.unreadCount > 0 && { fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
            {conv.lastMessage}
          </Text>
          {conv.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <LinearGradient colors={[QColors.primary, QColors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              <Text style={styles.unreadText}>{conv.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: QColors.primary + "15" }]}
          onPress={() => router.push({ pathname: "/call", params: { type: "audio", userId: conv.participantId, name: conv.participantName } })}>
          <Ionicons name="call-outline" size={16} color={QColors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: "#10B981" + "15" }]}
          onPress={() => router.push({ pathname: "/call", params: { type: "video", userId: conv.participantId, name: conv.participantName } })}>
          <Ionicons name="videocam-outline" size={16} color="#10B981" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function AudioItem({ item, index }: { item: SessionItem; index: number }) {
  const { colors } = useTheme();
  const missed = item.callStatus === "missed";
  return (
    <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]} activeOpacity={0.75}>
      <Avatar name={item.name} index={index} isOnline={item.isOnline} />
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.rowTime, { color: colors.textTertiary }]}>{getTimeAgo(item.time)}</Text>
        </View>
        <View style={styles.rowBottom}>
          <Ionicons name={missed ? "call-outline" : "call"} size={12} color={missed ? "#EF4444" : "#10B981"} />
          <Text style={[styles.rowSub, { color: missed ? "#EF4444" : colors.textSecondary, marginLeft: 4 }]}>
            {missed ? "Missed call" : `${item.duration}`}
          </Text>
          <Text style={[styles.rowSub, { color: colors.textTertiary }]}>  ·  {item.age}, {item.city}</Text>
        </View>
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: QColors.primary + "15" }]}
          onPress={() => router.push({ pathname: "/call", params: { type: "audio", userId: item.id, name: item.name } })}>
          <Ionicons name="call" size={16} color={QColors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function VideoItem({ item, index }: { item: SessionItem; index: number }) {
  const { colors } = useTheme();
  const missed = item.callStatus === "missed";
  return (
    <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]} activeOpacity={0.75}>
      <Avatar name={item.name} index={index} isOnline={item.isOnline} />
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.rowTime, { color: colors.textTertiary }]}>{getTimeAgo(item.time)}</Text>
        </View>
        <View style={styles.rowBottom}>
          <Ionicons name={missed ? "videocam-outline" : "videocam"} size={13} color={missed ? "#EF4444" : "#10B981"} />
          <Text style={[styles.rowSub, { color: missed ? "#EF4444" : colors.textSecondary, marginLeft: 4 }]}>
            {missed ? "Missed video" : `${item.duration}`}
          </Text>
          <Text style={[styles.rowSub, { color: colors.textTertiary }]}>  ·  {item.age}, {item.city}</Text>
        </View>
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: "#10B981" + "15" }]}
          onPress={() => router.push({ pathname: "/call", params: { type: "video", userId: item.id, name: item.name } })}>
          <Ionicons name="videocam" size={16} color="#10B981" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function MeetItem({ item, index }: { item: SessionItem; index: number }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]} activeOpacity={0.75}>
      <Avatar name={item.name} index={index} isOnline={item.isOnline} />
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.rowTime, { color: "#10B981" }]}>{getTimeAgo(item.time)}</Text>
        </View>
        <View style={styles.rowBottom}>
          <Ionicons name="location-outline" size={12} color={QColors.accent} />
          <Text style={[styles.rowSub, { color: colors.textSecondary, marginLeft: 3 }]} numberOfLines={1}>
            {item.meetDate}
          </Text>
        </View>
        {item.meetPlace && (
          <Text style={[styles.rowPlace, { color: colors.textTertiary }]} numberOfLines={1}>
            📍 {item.meetPlace}
          </Text>
        )}
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: QColors.accent + "15" }]}>
          <Ionicons name="map-outline" size={16} color={QColors.accent} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: QColors.primary + "15" }]}>
          <Ionicons name="chatbubble-outline" size={16} color={QColors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function ProposedItem({ item, index }: { item: SessionItem; index: number }) {
  const { colors } = useTheme();
  const byThem = item.proposedBy === "them";
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Avatar name={item.name} index={index} isOnline={item.isOnline} />
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.rowSub, { color: colors.textTertiary, marginTop: 1 }]}>
              {item.age} · {item.city}, {item.country}
            </Text>
          </View>
          <Text style={[styles.rowTime, { color: colors.textTertiary }]}>{getTimeAgo(item.time)}</Text>
        </View>
        <View style={[styles.proposedTag, { backgroundColor: byThem ? QColors.primary + "18" : "#10B981" + "18" }]}>
          <Text style={[styles.proposedTagText, { color: byThem ? QColors.primary : "#10B981" }]}>
            {byThem ? "Wants to connect with you" : "You proposed"}
          </Text>
        </View>
      </View>
      <View style={[styles.rowActions, { gap: 6 }]}>
        {byThem && (
          <TouchableOpacity style={styles.acceptBtn}>
            <LinearGradient colors={[QColors.primary, QColors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            <Ionicons name="checkmark" size={16} color="#fff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: QColors.primary + "15" }]}
          onPress={() => router.push({ pathname: "/call", params: { type: "audio", userId: item.id, name: item.name } })}>
          <Ionicons name="call-outline" size={15} color={QColors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: "#10B981" + "15" }]}
          onPress={() => router.push({ pathname: "/call", params: { type: "video", userId: item.id, name: item.name } })}>
          <Ionicons name="videocam-outline" size={15} color="#10B981" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: QColors.accent + "15" }]}>
          <Ionicons name="chatbubble-outline" size={15} color={QColors.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const TABS: { key: SessionTab; label: string; icon: any }[] = [
  { key: "chat", label: "Chats", icon: "chatbubble-outline" },
  { key: "audio", label: "Audio", icon: "call-outline" },
  { key: "video", label: "Video", icon: "videocam-outline" },
  { key: "meet", label: "Meet", icon: "location-outline" },
  { key: "proposed", label: "Proposed", icon: "people-outline" },
];

export default function SessionScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { conversations } = useChat();
  const [activeTab, setActiveTab] = useState<SessionTab>("chat");

  const getCounts = (tab: SessionTab) => {
    if (tab === "chat") return conversations.length;
    if (tab === "audio") return MOCK_AUDIO.length;
    if (tab === "video") return MOCK_VIDEO.length;
    if (tab === "meet") return MOCK_MEET.length;
    if (tab === "proposed") return MOCK_PROPOSED.filter((p) => p.proposedBy === "them").length;
    return 0;
  };

  const renderContent = () => {
    if (activeTab === "chat") {
      if (conversations.length === 0) return <EmptyState icon="chatbubbles" text="No chats yet" sub="Swipe down on a profile to start chatting" />;
      return (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          renderItem={({ item, index }) => <ChatItem conv={item} index={index} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        />
      );
    }
    if (activeTab === "audio") {
      if (MOCK_AUDIO.length === 0) return <EmptyState icon="call" text="No audio calls yet" sub="Swipe left on a profile to start an audio call" />;
      return (
        <FlatList
          data={MOCK_AUDIO}
          keyExtractor={(i) => i.id}
          renderItem={({ item, index }) => <AudioItem item={item} index={index} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        />
      );
    }
    if (activeTab === "video") {
      if (MOCK_VIDEO.length === 0) return <EmptyState icon="videocam" text="No video calls yet" sub="Swipe right on a profile to start a video call" />;
      return (
        <FlatList
          data={MOCK_VIDEO}
          keyExtractor={(i) => i.id}
          renderItem={({ item, index }) => <VideoItem item={item} index={index} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        />
      );
    }
    if (activeTab === "meet") {
      if (MOCK_MEET.length === 0) return <EmptyState icon="map" text="No meetups planned" sub="Connect with someone and plan a meetup" />;
      return (
        <FlatList
          data={MOCK_MEET}
          keyExtractor={(i) => i.id}
          renderItem={({ item, index }) => <MeetItem item={item} index={index} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        />
      );
    }
    if (activeTab === "proposed") {
      if (MOCK_PROPOSED.length === 0) return <EmptyState icon="people" text="No proposals" sub="Proposals from others will appear here" />;
      return (
        <FlatList
          data={MOCK_PROPOSED}
          keyExtractor={(i) => i.id}
          renderItem={({ item, index }) => <ProposedItem item={item} index={index} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        />
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Sessions</Text>
        <View style={styles.headerRight}>
          {getCounts(activeTab) > 0 && (
            <View style={styles.totalBadge}>
              <LinearGradient colors={[QColors.primary, QColors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              <Text style={styles.totalBadgeText}>{getCounts(activeTab)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabScrollContent}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          const count = tab.key === "proposed" ? getCounts("proposed") : 0;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                active && styles.tabActive,
                active && { borderBottomColor: QColors.primary },
                !active && { borderBottomColor: "transparent" },
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={active ? QColors.primary : colors.textTertiary}
              />
              <Text style={[styles.tabLabel, { color: active ? QColors.primary : colors.textTertiary }]}>
                {tab.label}
              </Text>
              {count > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Content */}
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
    </View>
  );
}

function EmptyState({ icon, text, sub }: { icon: any; text: string; sub: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <LinearGradient colors={[QColors.primary, QColors.accent]} style={styles.emptyIcon}>
        <Ionicons name={icon} size={36} color="#fff" />
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{text}</Text>
      <Text style={[styles.emptySub, { color: colors.textSecondary }]}>{sub}</Text>
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
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  totalBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  totalBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  tabScroll: {
    flexGrow: 0,
  },
  tabScrollContent: {
    paddingHorizontal: 12,
    gap: 4,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 2,
    marginBottom: -1,
  },
  tabActive: {},
  tabLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  tabBadge: {
    backgroundColor: QColors.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowContent: {
    flex: 1,
    gap: 3,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  rowTime: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flexShrink: 0,
  },
  rowSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  rowPlace: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  proposedTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  proposedTagText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
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
