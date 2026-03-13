import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QColors } from "@/constants/colors";
import { ProfileCard } from "@/context/DiscoverContext";
import { useTheme } from "@/constants/theme";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const AVATAR_COLORS = [
  ["#7C3AED", "#EC4899"],
  ["#EC4899", "#F59E0B"],
  ["#10B981", "#3B82F6"],
  ["#F59E0B", "#EF4444"],
  ["#6366F1", "#8B5CF6"],
  ["#14B8A6", "#3B82F6"],
];

type Props = {
  profile: ProfileCard | null;
  visible: boolean;
  onClose: () => void;
  onAudioCall: () => void;
  onVideoCall: () => void;
  onChat: () => void;
};

export function ProfileDetailModal({
  profile,
  visible,
  onClose,
  onAudioCall,
  onVideoCall,
  onChat,
}: Props) {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  if (!profile) return null;

  const gradColors = AVATAR_COLORS[parseInt(profile.id) % AVATAR_COLORS.length] as [string, string];

  const sections = [
    { icon: "briefcase-outline", label: "Occupation", value: profile.occupation },
    { icon: "school-outline", label: "Education", value: profile.education },
    { icon: "people-outline", label: "Personality", value: profile.personalityType },
    { icon: "heart-outline", label: "Relationship Style", value: profile.relationshipStyle },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        >
          {/* Hero */}
          <LinearGradient
            colors={[gradColors[0], gradColors[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroInitials}>
              {profile.firstName[0]}{profile.lastName[0]}
            </Text>

            {profile.isOnline && (
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online Now</Text>
              </View>
            )}

            {/* Photo thumbnails */}
            <View style={styles.photoGrid}>
              {[1, 2, 3].map((i) => (
                <LinearGradient
                  key={i}
                  colors={[gradColors[1], gradColors[0]]}
                  style={styles.photoThumb}
                >
                  <Text style={styles.photoThumbText}>{profile.firstName[0]}</Text>
                </LinearGradient>
              ))}
            </View>
          </LinearGradient>

          {/* Close button */}
          <TouchableOpacity
            style={[styles.closeBtn, { top: insets.top + 16 }]}
            onPress={onClose}
          >
            <Ionicons name="chevron-down" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Profile Info */}
          <View style={[styles.content, { paddingHorizontal: 20 }]}>
            {/* Name + Verification */}
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.text }]}>
                {profile.firstName} {profile.lastName}
              </Text>
              <Text style={[styles.age, { color: colors.textSecondary }]}>, {profile.age}</Text>
              <MaterialCommunityIcons name="shield-check" size={20} color={QColors.primary} style={{ marginLeft: 6 }} />
            </View>

            {/* Location */}
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={QColors.primary} />
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                {profile.city}, {profile.country}
                {profile.distance !== undefined && ` · ${profile.distance < 100 ? profile.distance + " km" : Math.round(profile.distance / 100) / 10 + "k km"} away`}
              </Text>
            </View>

            {/* Bio */}
            <View style={[styles.card, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
              <Text style={[styles.bioText, { color: colors.text }]}>{profile.bio}</Text>
            </View>

            {/* Interests */}
            <View style={[styles.card, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Interests</Text>
              <View style={styles.chips}>
                {profile.interests.map((i) => (
                  <View key={i} style={[styles.chip, { backgroundColor: QColors.primaryLight }]}>
                    <Text style={[styles.chipText, { color: QColors.primary }]}>{i}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Looking For */}
            <View style={[styles.card, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Looking For</Text>
              <View style={styles.chips}>
                {profile.lookingFor.map((l) => (
                  <View key={l} style={[styles.chip, { backgroundColor: QColors.accentLight }]}>
                    <Text style={[styles.chipText, { color: QColors.accent }]}>{l.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Details */}
            <View style={[styles.card, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Details</Text>
              {sections.filter(s => s.value).map((s) => (
                <View key={s.label} style={styles.detailRow}>
                  <Ionicons name={s.icon as any} size={16} color={QColors.primary} />
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{s.label}</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{s.value}</Text>
                </View>
              ))}
            </View>

            {/* Languages */}
            {profile.languages.length > 0 && (
              <View style={[styles.card, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Languages</Text>
                <View style={styles.chips}>
                  {profile.languages.map((l) => (
                    <View key={l} style={[styles.chip, { backgroundColor: isDark ? colors.backgroundTertiary : "#F3F4F6" }]}>
                      <Text style={[styles.chipText, { color: colors.text }]}>{l}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Action buttons */}
        <View style={[styles.actions, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background }]}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: QColors.primary + "15" }]} onPress={onAudioCall}>
            <Ionicons name="call" size={22} color={QColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtnPrimary]} onPress={onChat}>
            <LinearGradient
              colors={[QColors.primary, QColors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="chatbubble" size={22} color="#fff" />
            <Text style={styles.actionBtnText}>Start Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#10B98115" }]} onPress={onVideoCall}>
            <Ionicons name="videocam" size={22} color="#10B981" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    height: SCREEN_H * 0.4,
    alignItems: "center",
    justifyContent: "center",
  },
  heroInitials: {
    fontSize: 72,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.85)",
  },
  onlineBadge: {
    position: "absolute",
    top: 24,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
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
  photoGrid: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    gap: 8,
  },
  photoThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  photoThumbText: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingTop: 20,
    gap: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  age: {
    fontSize: 24,
    fontFamily: "Inter_400Regular",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: -4,
  },
  locationText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bioText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textTransform: "capitalize",
  },
  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  actionBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnPrimary: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    overflow: "hidden",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
