import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
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
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/constants/theme";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { profiles, currentIndex, swipeLeft, swipeRight, nextProfile, resetFeed } = useDiscover();
  const { createOrGetConversation } = useChat();
  const { user } = useAuth();
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <View style={styles.headerLeft}>
          <QRomesLogo size={28} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>QRomes</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.locationPill}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Ionicons
              name="location"
              size={11}
              color={isDark ? "#A78BFA" : QColors.primary}
            />
            <Text
              style={[styles.locationPillText, { color: isDark ? "#A78BFA" : QColors.primary }]}
              numberOfLines={1}
            >
              {(user?.city || user?.country)
                ? [user.city, user.country].filter(Boolean).join(", ")
                : "Set location"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.coinBadge}>
            <LinearGradient
              colors={[QColors.gold, "#F97316"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="flash" size={12} color="#fff" />
            <Text style={styles.coinText}>{user?.coinBalance ?? 100}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileAvatar}
            onPress={() => router.push("/(tabs)/profile")}
            activeOpacity={0.8}
          >
            {user?.photos?.[0] ? (
              <Image
                source={{ uri: user.photos[0] }}
                style={[StyleSheet.absoluteFill, { borderRadius: 18 }]}
                resizeMode="cover"
              />
            ) : (
              <>
                <LinearGradient
                  colors={[QColors.primary, QColors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                {user?.firstName ? (
                  <Text style={styles.profileAvatarInitial}>
                    {user.firstName[0].toUpperCase()}
                  </Text>
                ) : (
                  <Ionicons name="person" size={14} color="#fff" />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Stack — fills all remaining space */}
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

      {/* Tinder-style Action Buttons */}
      {!isEmpty && (
        <View style={[styles.actions, { paddingBottom: insets.bottom + 62 }]}>
          {/* Undo */}
          <TouchableOpacity
            style={[styles.actionRing, { borderColor: QColors.gold }]}
            onPress={() => nextProfile()}
          >
            <Ionicons name="arrow-undo" size={22} color={QColors.gold} />
          </TouchableOpacity>

          {/* Pass / Audio call (swipe left = audio) */}
          <TouchableOpacity
            style={[styles.actionRingLg, { borderColor: "#EF4444" }]}
            onPress={() => handleAudioCall(currentProfile)}
          >
            <Ionicons name="close" size={32} color="#EF4444" />
          </TouchableOpacity>

          {/* Star / Super like */}
          <TouchableOpacity
            style={[styles.actionRing, { borderColor: "#3B82F6" }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              nextProfile();
            }}
          >
            <Ionicons name="star" size={22} color="#3B82F6" />
          </TouchableOpacity>

          {/* Heart / Video call (swipe right = video) */}
          <TouchableOpacity
            style={[styles.actionRingLg, { borderColor: "#10B981" }]}
            onPress={() => handleVideoCall(currentProfile)}
          >
            <Ionicons name="heart" size={30} color="#10B981" />
          </TouchableOpacity>

          {/* Boost / Chat */}
          <TouchableOpacity
            style={styles.boostBtn}
            onPress={() => handleChat(currentProfile)}
          >
            <LinearGradient
              colors={[QColors.primary, QColors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: 110,
  },
  locationPillText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    flexShrink: 1,
  },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  coinText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  profileAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarInitial: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
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
    gap: 14,
    paddingTop: 8,
    paddingHorizontal: 20,
  },
  actionRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  actionRingLg: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  boostBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
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
