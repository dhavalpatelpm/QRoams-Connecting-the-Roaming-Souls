import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { QColors } from "@/constants/colors";
import { ProfileCard as ProfileCardType } from "@/context/DiscoverContext";
import { useTheme } from "@/constants/theme";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const CARD_W = SCREEN_W - 16;
const CARD_H = SCREEN_H * 0.70;
const SWIPE_THRESHOLD = 80;

type Props = {
  profile: ProfileCardType;
  isTop: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onPress: () => void;
  cardIndex: number;
};

const AVATAR_COLORS = [
  ["#7C3AED", "#EC4899"],
  ["#EC4899", "#F59E0B"],
  ["#10B981", "#3B82F6"],
  ["#F59E0B", "#EF4444"],
  ["#6366F1", "#8B5CF6"],
  ["#14B8A6", "#3B82F6"],
];

export function ProfileCard({
  profile,
  isTop,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPress,
  cardIndex,
}: Props) {
  const { isDark } = useTheme();
  const position = useRef(new Animated.ValueXY()).current;
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | "up" | "down" | null>(null);
  const gradColors = AVATAR_COLORS[parseInt(profile.id) % AVATAR_COLORS.length] as [string, string];

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_W / 2, 0, SCREEN_W / 2],
    outputRange: ["-12deg", "0deg", "12deg"],
    extrapolate: "clamp",
  });

  const audioOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -20, 0],
    outputRange: [1, 0.4, 0],
    extrapolate: "clamp",
  });

  const videoOpacity = position.x.interpolate({
    inputRange: [0, 20, SWIPE_THRESHOLD],
    outputRange: [0, 0.4, 1],
    extrapolate: "clamp",
  });

  const changeOpacity = position.y.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -20, 0],
    outputRange: [1, 0.4, 0],
    extrapolate: "clamp",
  });

  const chatOpacity = position.y.interpolate({
    inputRange: [0, 20, SWIPE_THRESHOLD],
    outputRange: [0, 0.4, 1],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTop,
      onMoveShouldSetPanResponder: (_, g) =>
        isTop && (Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5),
      onPanResponderMove: (_, g) => {
        position.setValue({ x: g.dx, y: g.dy });
        const absDx = Math.abs(g.dx);
        const absDy = Math.abs(g.dy);
        if (absDx > absDy) {
          setSwipeDir(g.dx > 0 ? "right" : "left");
        } else {
          setSwipeDir(g.dy > 0 ? "down" : "up");
        }
      },
      onPanResponderRelease: (_, g) => {
        const absDx = Math.abs(g.dx);
        const absDy = Math.abs(g.dy);

        if (absDx < 10 && absDy < 10) {
          setSwipeDir(null);
          return;
        }

        if (absDx > absDy) {
          if (g.dx > SWIPE_THRESHOLD) {
            triggerSwipe("right");
          } else if (g.dx < -SWIPE_THRESHOLD) {
            triggerSwipe("left");
          } else {
            resetPosition();
          }
        } else {
          if (g.dy < -SWIPE_THRESHOLD) {
            triggerSwipe("up");
          } else if (g.dy > SWIPE_THRESHOLD) {
            triggerSwipe("down");
          } else {
            resetPosition();
          }
        }
      },
    })
  ).current;

  const triggerSwipe = (dir: "left" | "right" | "up" | "down") => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const toX = dir === "left" ? -SCREEN_W * 1.5 : dir === "right" ? SCREEN_W * 1.5 : 0;
    const toY = dir === "up" ? -SCREEN_H * 1.5 : dir === "down" ? SCREEN_H * 1.5 : 0;
    Animated.spring(position, {
      toValue: { x: toX, y: toY },
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start(() => {
      setSwipeDir(null);
      position.setValue({ x: 0, y: 0 });
      if (dir === "left") onSwipeLeft();
      if (dir === "right") onSwipeRight();
      if (dir === "up") onSwipeUp();
      if (dir === "down") onSwipeDown();
    });
  };

  const resetPosition = () => {
    setSwipeDir(null);
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const cardStyle = isTop
    ? {
        transform: [
          { translateX: position.x },
          { translateY: position.y },
          { rotate },
        ],
      }
    : {
        transform: [{ scale: 0.95 }, { translateY: 12 }],
      };

  return (
    <Animated.View
      style={[styles.card, cardStyle, !isTop && styles.backCard]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={isTop ? onPress : undefined}
        style={StyleSheet.absoluteFill}
      >
        {/* Avatar / Photo area */}
        <LinearGradient
          colors={[gradColors[0], gradColors[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.photoArea}
        >
          {/* Initials */}
          <Text style={styles.initials}>
            {profile.firstName[0]}{profile.lastName[0]}
          </Text>

          {/* Online badge */}
          {profile.isOnline && (
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          )}

          {/* Distance */}
          {profile.distance !== undefined && (
            <View style={styles.distanceBadge}>
              <Ionicons name="location" size={12} color="#fff" />
              <Text style={styles.distanceText}>
                {profile.distance < 100
                  ? `${profile.distance} km`
                  : `${Math.round(profile.distance / 100) / 10}k km`}
              </Text>
            </View>
          )}

          {/* Photo dots indicator */}
          <View style={styles.photoDots}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
            ))}
          </View>
        </LinearGradient>

        {/* Info overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={styles.infoGradient}
        >
          <View style={styles.infoContent}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>
                {profile.firstName}, {profile.age}
              </Text>
              <MaterialCommunityIcons
                name="shield-check"
                size={18}
                color={QColors.primary}
              />
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.location}>
                {profile.city}, {profile.country}
              </Text>
            </View>
            {profile.occupation && (
              <Text style={styles.occupation} numberOfLines={1}>
                {profile.occupation}
              </Text>
            )}
            <Text style={styles.bio} numberOfLines={2}>
              {profile.bio}
            </Text>

            {/* Interest chips */}
            <View style={styles.interests}>
              {profile.interests.slice(0, 3).map((interest) => (
                <View key={interest} style={styles.chip}>
                  <Text style={styles.chipText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        {/* Swipe direction indicators */}
        {isTop && (
          <>
            {/* Left = Audio Call */}
            <Animated.View style={[styles.swipeIndicator, styles.swipeLeft, { opacity: audioOpacity }]}>
              <View style={[styles.swipeIconBg, { backgroundColor: "rgba(124,58,237,0.9)" }]}>
                <Ionicons name="call" size={32} color="#fff" />
              </View>
              <Text style={styles.swipeLabel}>AUDIO CALL</Text>
            </Animated.View>

            {/* Right = Video Call */}
            <Animated.View style={[styles.swipeIndicator, styles.swipeRight, { opacity: videoOpacity }]}>
              <View style={[styles.swipeIconBg, { backgroundColor: "rgba(16,185,129,0.9)" }]}>
                <Ionicons name="videocam" size={32} color="#fff" />
              </View>
              <Text style={styles.swipeLabel}>VIDEO CALL</Text>
            </Animated.View>

            {/* Up = Change Profile */}
            <Animated.View style={[styles.swipeIndicator, styles.swipeUp, { opacity: changeOpacity }]}>
              <View style={[styles.swipeIconBg, { backgroundColor: "rgba(245,158,11,0.9)" }]}>
                <Ionicons name="refresh" size={32} color="#fff" />
              </View>
              <Text style={styles.swipeLabel}>NEXT</Text>
            </Animated.View>

            {/* Down = Open Chat */}
            <Animated.View style={[styles.swipeIndicator, styles.swipeDown, { opacity: chatOpacity }]}>
              <View style={[styles.swipeIconBg, { backgroundColor: "rgba(236,72,153,0.9)" }]}>
                <Ionicons name="chatbubble" size={32} color="#fff" />
              </View>
              <Text style={styles.swipeLabel}>OPEN CHAT</Text>
            </Animated.View>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  backCard: {
    opacity: 0.9,
  },
  photoArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontSize: 80,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.85)",
  },
  onlineBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  onlineText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  distanceBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 3,
  },
  distanceText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  photoDots: {
    position: "absolute",
    top: 12,
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dotActive: {
    backgroundColor: "#fff",
  },
  infoGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  infoContent: {
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  location: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_400Regular",
  },
  occupation: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    fontFamily: "Inter_400Regular",
  },
  bio: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginTop: 4,
  },
  interests: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  chip: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  chipText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  swipeIndicator: {
    position: "absolute",
    alignItems: "center",
    gap: 6,
  },
  swipeLeft: {
    left: 24,
    top: "40%",
  },
  swipeRight: {
    right: 24,
    top: "40%",
  },
  swipeUp: {
    top: 24,
    alignSelf: "center",
    left: "50%",
    transform: [{ translateX: -30 }],
  },
  swipeDown: {
    bottom: 100,
    alignSelf: "center",
    left: "50%",
    transform: [{ translateX: -30 }],
  },
  swipeIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  swipeLabel: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
