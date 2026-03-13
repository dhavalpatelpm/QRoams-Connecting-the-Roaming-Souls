import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QColors } from "@/constants/colors";
import { ProfileCard } from "@/components/ProfileCard";
import { ProfileDetailModal } from "@/components/ProfileDetailModal";
import { QRomesLogo } from "@/components/QRomesLogo";
import { useDiscover, ProfileCard as ProfileCardType } from "@/context/DiscoverContext";
import { useChat } from "@/context/ChatContext";
import { useTheme } from "@/constants/theme";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { profiles, currentIndex, swipeLeft, swipeRight, nextProfile, resetFeed } = useDiscover();
  const { createOrGetConversation } = useChat();
  const [selectedProfile, setSelectedProfile] = useState<ProfileCardType | null>(null);

  const currentProfile = profiles[currentIndex];
  const nextProfileCard = profiles[currentIndex + 1];

  const handleAudioCall = (profile?: ProfileCardType) => {
    const p = profile || currentProfile;
    if (!p) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    swipeLeft(p.id);
    router.push({ pathname: "/call", params: { type: "audio", userId: p.id, name: p.firstName } });
  };

  const handleVideoCall = (profile?: ProfileCardType) => {
    const p = profile || currentProfile;
    if (!p) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    swipeRight(p.id);
    router.push({ pathname: "/call", params: { type: "video", userId: p.id, name: p.firstName } });
  };

  const handleChat = (profile?: ProfileCardType) => {
    const p = profile || currentProfile;
    if (!p) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedProfile(null);
    const convId = createOrGetConversation({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      age: p.age,
      isOnline: p.isOnline,
    });
    nextProfile();
    router.push({ pathname: "/chat/[id]", params: { id: convId } });
  };

  const isEmpty = currentIndex >= profiles.length;

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <QRomesLogo size={32} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>QRomes</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: isDark ? colors.backgroundSecondary : "#F3F4F6" }]}
          >
            <Ionicons name="options-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.coinBadge]}
          >
            <LinearGradient
              colors={[QColors.gold, "#F97316"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="flash" size={13} color="#fff" />
            <Text style={styles.coinText}>100</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipe hint */}
      <View style={styles.hintRow}>
        <View style={[styles.hint, { backgroundColor: QColors.primary + "20" }]}>
          <Ionicons name="arrow-back" size={12} color={QColors.primary} />
          <Text style={[styles.hintText, { color: QColors.primary }]}>Audio</Text>
        </View>
        <View style={[styles.hint, { backgroundColor: "#10B98120" }]}>
          <Ionicons name="arrow-up" size={12} color="#10B981" />
          <Text style={[styles.hintText, { color: "#10B981" }]}>Next</Text>
        </View>
        <View style={[styles.hint, { backgroundColor: QColors.accent + "20" }]}>
          <Ionicons name="arrow-down" size={12} color={QColors.accent} />
          <Text style={[styles.hintText, { color: QColors.accent }]}>Chat</Text>
        </View>
        <View style={[styles.hint, { backgroundColor: "#10B98120" }]}>
          <Text style={[styles.hintText, { color: "#10B981" }]}>Video</Text>
          <Ionicons name="arrow-forward" size={12} color="#10B981" />
        </View>
      </View>

      {/* Card Stack */}
      <View style={styles.cardStack}>
        {isEmpty ? (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={[QColors.primary, QColors.accent]}
              style={styles.emptyIconBg}
            >
              <Ionicons name="people" size={40} color="#fff" />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              You've seen everyone!
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Check back soon for more roaming souls
            </Text>
            <TouchableOpacity style={styles.resetBtn} onPress={resetFeed}>
              <LinearGradient
                colors={[QColors.primary, QColors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.resetBtnText}>Refresh Feed</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {nextProfileCard && (
              <ProfileCard
                profile={nextProfileCard}
                isTop={false}
                onSwipeLeft={() => {}}
                onSwipeRight={() => {}}
                onSwipeUp={() => {}}
                onSwipeDown={() => {}}
                onPress={() => {}}
                cardIndex={currentIndex + 1}
              />
            )}
            <ProfileCard
              profile={currentProfile}
              isTop={true}
              onSwipeLeft={() => handleAudioCall(currentProfile)}
              onSwipeRight={() => handleVideoCall(currentProfile)}
              onSwipeUp={() => nextProfile()}
              onSwipeDown={() => handleChat(currentProfile)}
              onPress={() => setSelectedProfile(currentProfile)}
              cardIndex={currentIndex}
            />
          </>
        )}
      </View>

      {/* Action buttons */}
      {!isEmpty && (
        <View style={[styles.actions, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 90 }]}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: QColors.primary + "15" }]}
            onPress={() => handleAudioCall(currentProfile)}
          >
            <Ionicons name="call" size={22} color={QColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#F3F4F6" }]}
            onPress={() => nextProfile()}
          >
            <Ionicons name="refresh" size={22} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sparkBtn}
            onPress={() => handleVideoCall(currentProfile)}
          >
            <LinearGradient
              colors={[QColors.primary, QColors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="videocam" size={26} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: QColors.accent + "15" }]}
            onPress={() => handleChat(currentProfile)}
          >
            <Ionicons name="chatbubble" size={22} color={QColors.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: QColors.gold + "15" }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              nextProfile();
            }}
          >
            <Ionicons name="star" size={22} color={QColors.gold} />
          </TouchableOpacity>
        </View>
      )}

      {/* Profile Detail Modal */}
      <ProfileDetailModal
        profile={selectedProfile}
        visible={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onAudioCall={() => handleAudioCall(selectedProfile!)}
        onVideoCall={() => handleVideoCall(selectedProfile!)}
        onChat={() => handleChat(selectedProfile!)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
    gap: 4,
  },
  coinText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  hintRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  hint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  hintText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  cardStack: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  actionBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  sparkBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: QColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  emptyState: {
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  resetBtn: {
    height: 52,
    paddingHorizontal: 28,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
    marginTop: 8,
  },
  resetBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
