import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QColors } from "@/constants/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const AVATAR_COLORS = [
  ["#7C3AED", "#EC4899"],
  ["#EC4899", "#F59E0B"],
  ["#10B981", "#3B82F6"],
  ["#F59E0B", "#EF4444"],
];

export default function CallScreen() {
  const insets = useSafeAreaInsets();
  const { type, userId, name } = useLocalSearchParams<{
    type: "audio" | "video";
    userId: string;
    name: string;
  }>();
  const [callState, setCallState] = useState<"ringing" | "active" | "ended">("ringing");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const gradColors = AVATAR_COLORS[(parseInt(userId ?? "0") || 0) % AVATAR_COLORS.length] as [string, string];

  useEffect(() => {
    // Simulate auto-accept after 3 seconds
    const autoAccept = setTimeout(() => {
      setCallState("active");
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }, 3000);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();

    return () => {
      clearTimeout(autoAccept);
      if (timerRef.current) clearInterval(timerRef.current);
      pulse.stop();
    };
  }, []);

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState("ended");
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setTimeout(() => router.back(), 1500);
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <LinearGradient
      colors={["#0A0A0F", "#1a0530", "#2d0a5a"]}
      style={styles.container}
    >
      {/* Decorative elements */}
      <View style={[styles.deco, styles.decoTL]} />
      <View style={[styles.deco, styles.decoBR]} />

      {/* Status */}
      <View style={[styles.topArea, { paddingTop: Platform.OS === "web" ? 80 : insets.top + 20 }]}>
        <View style={styles.callTypeBadge}>
          <Ionicons
            name={type === "video" ? "videocam" : "call"}
            size={14}
            color={QColors.primary}
          />
          <Text style={styles.callTypeBadgeText}>
            {type === "video" ? "Video" : "Audio"} Call
          </Text>
        </View>

        <Text style={styles.statusText}>
          {callState === "ringing"
            ? "Ringing..."
            : callState === "active"
            ? formatDuration(duration)
            : "Call Ended"}
        </Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarArea}>
        <Animated.View style={{ transform: [{ scale: callState === "ringing" ? pulseAnim : 1 }] }}>
          <LinearGradient
            colors={[gradColors[0], gradColors[1]]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{(name ?? "U")[0]}</Text>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.calleeName}>{name ?? "Unknown"}</Text>

        {callState === "active" && (
          <View style={styles.activeBadge}>
            <View style={styles.activeWave} />
            <Text style={styles.activeBadgeText}>Connected</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      {callState !== "ended" && (
        <View style={[styles.controls, { paddingBottom: Platform.OS === "web" ? 50 : insets.bottom + 30 }]}>
          {type === "video" ? (
            // Video call controls
            <View style={styles.controlsGrid}>
              <View style={styles.controlsRow}>
                <TouchableOpacity
                  style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
                  onPress={() => setIsMuted(!isMuted)}
                >
                  <Ionicons name={isMuted ? "mic-off" : "mic"} size={22} color={isMuted ? QColors.error : "#fff"} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlBtn, isCameraOff && styles.controlBtnActive]}
                  onPress={() => setIsCameraOff(!isCameraOff)}
                >
                  <Ionicons name={isCameraOff ? "videocam-off" : "videocam"} size={22} color={isCameraOff ? QColors.error : "#fff"} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlBtn}>
                  <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlBtn}>
                  <Ionicons name="chatbubble-outline" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.endBtn} onPress={handleEndCall}>
                <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: "135deg" }] }} />
              </TouchableOpacity>
            </View>
          ) : (
            // Audio call controls
            <View style={styles.controlsGrid}>
              <View style={styles.controlsRow}>
                <TouchableOpacity
                  style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
                  onPress={() => setIsMuted(!isMuted)}
                >
                  <Ionicons name={isMuted ? "mic-off" : "mic"} size={22} color={isMuted ? QColors.error : "#fff"} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlBtn, isSpeaker && styles.controlBtnSpeaker]}
                  onPress={() => setIsSpeaker(!isSpeaker)}
                >
                  <Ionicons name={isSpeaker ? "volume-high" : "volume-medium"} size={22} color={isSpeaker ? QColors.primary : "#fff"} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlBtn}>
                  <Ionicons name="chatbubble-outline" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.endBtn} onPress={handleEndCall}>
                <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: "135deg" }] }} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {callState === "ended" && (
        <View style={styles.endedMsg}>
          <Text style={styles.endedText}>Call Ended · {formatDuration(duration)}</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  deco: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: QColors.primary,
    opacity: 0.08,
  },
  decoTL: {
    top: -100,
    right: -80,
  },
  decoBR: {
    bottom: -100,
    left: -80,
    backgroundColor: QColors.accent,
  },
  topArea: {
    alignItems: "center",
    gap: 8,
  },
  callTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(124,58,237,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.3)",
  },
  callTypeBadgeText: {
    color: QColors.primary,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  statusText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  avatarArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: QColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  avatarText: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.9)",
  },
  calleeName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(16,185,129,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
  activeWave: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  activeBadgeText: {
    color: "#10B981",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  controls: {
    width: "100%",
    paddingHorizontal: 40,
  },
  controlsGrid: {
    alignItems: "center",
    gap: 24,
  },
  controlsRow: {
    flexDirection: "row",
    gap: 20,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  controlBtnActive: {
    backgroundColor: "rgba(239,68,68,0.2)",
  },
  controlBtnSpeaker: {
    backgroundColor: "rgba(124,58,237,0.2)",
  },
  endBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: QColors.error,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: QColors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  endedMsg: {
    paddingBottom: 80,
  },
  endedText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
});
