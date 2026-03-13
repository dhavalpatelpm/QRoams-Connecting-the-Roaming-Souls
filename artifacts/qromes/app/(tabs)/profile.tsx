import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QColors } from "@/constants/colors";
import { useTheme } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

const AVATAR_COLORS = ["#7C3AED", "#EC4899", "#10B981", "#F59E0B", "#6366F1"];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const colorScheme = useColorScheme();
  const { user, logout, updateUser } = useAuth();
  const [isOnline, setIsOnline] = useState(user?.isOnline ?? true);
  const [notifEnabled, setNotifEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/onboarding");
          },
        },
      ]
    );
  };

  const toggleOnline = (val: boolean) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsOnline(val);
    updateUser({ isOnline: val });
  };

  const avatarColor = AVATAR_COLORS[(user?.id?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const stats = [
    { label: "Connections", value: "24", icon: "people" as const },
    { label: "Chats", value: "8", icon: "chatbubbles" as const },
    { label: "Calls", value: "12", icon: "call" as const },
  ];

  const settingsGroups = [
    {
      title: "Account",
      items: [
        { icon: "person-outline" as const, label: "Edit Profile", arrow: true },
        { icon: "images-outline" as const, label: "Manage Photos", arrow: true },
        { icon: "shield-checkmark-outline" as const, label: "Privacy Settings", arrow: true },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: "notifications-outline" as const,
          label: "Notifications",
          toggle: true,
          value: notifEnabled,
          onToggle: setNotifEnabled,
        },
        {
          icon: "radio-button-on-outline" as const,
          label: "Online Status",
          toggle: true,
          value: isOnline,
          onToggle: toggleOnline,
        },
      ],
    },
    {
      title: "More",
      items: [
        { icon: "help-circle-outline" as const, label: "Help & Support", arrow: true },
        { icon: "document-text-outline" as const, label: "Terms & Privacy", arrow: true },
        { icon: "information-circle-outline" as const, label: "About QRomes", arrow: true },
      ],
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Header Gradient */}
      <LinearGradient
        colors={[QColors.primaryDark, QColors.primary, QColors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: topPadding + 8 }]}
      >
        {/* Settings button */}
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: avatarColor + "CC" }]}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0] ?? "Q"}{user?.lastName?.[0] ?? "R"}
            </Text>
          </View>
          <View style={[styles.onlineIndicator, { backgroundColor: isOnline ? "#10B981" : "#6B7280" }]} />
        </View>

        <Text style={styles.name}>
          {user?.firstName ?? "QRomian"} {user?.lastName ?? ""}
        </Text>
        <Text style={styles.location}>
          {user?.city ?? "Unknown City"}, {user?.country ?? "World"}
        </Text>

        {/* Coin balance */}
        <View style={styles.coinRow}>
          <Ionicons name="flash" size={16} color={QColors.gold} />
          <Text style={styles.coinText}>{user?.coinBalance ?? 100} coins</Text>
          <TouchableOpacity style={styles.addCoins}>
            <Ionicons name="add" size={14} color="#fff" />
            <Text style={styles.addCoinsText}>Add</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={[styles.statsRow, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
        {stats.map((s, i) => (
          <View key={s.label} style={[styles.statItem, i < stats.length - 1 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: isDark ? colors.border : "#E5E7EB" }]}>
            <Ionicons name={s.icon} size={20} color={QColors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Bio + Interests */}
      {user?.bio && (
        <View style={[styles.card, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
          <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>ABOUT</Text>
          <Text style={[styles.bioText, { color: colors.text }]}>{user.bio}</Text>
        </View>
      )}

      {user?.interests && user.interests.length > 0 && (
        <View style={[styles.card, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
          <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>INTERESTS</Text>
          <View style={styles.chips}>
            {user.interests.map((i) => (
              <View key={i} style={[styles.chip, { backgroundColor: QColors.primaryLight }]}>
                <Text style={[styles.chipText, { color: QColors.primary }]}>{i}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Settings Groups */}
      {settingsGroups.map((group) => (
        <View key={group.title} style={styles.settingsGroup}>
          <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>{group.title}</Text>
          <View style={[styles.settingsCard, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
            {group.items.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.settingsItem,
                  idx < group.items.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: isDark ? colors.border : "#E5E7EB",
                  },
                ]}
                activeOpacity={"toggle" in item ? 1 : 0.7}
              >
                <View style={[styles.settingsIconBg, { backgroundColor: QColors.primaryLight }]}>
                  <Ionicons name={item.icon} size={16} color={QColors.primary} />
                </View>
                <Text style={[styles.settingsLabel, { color: colors.text }]}>{item.label}</Text>
                {"toggle" in item && item.toggle ? (
                  <Switch
                    value={item.value as boolean}
                    onValueChange={item.onToggle}
                    trackColor={{ false: "#E5E7EB", true: QColors.primary }}
                    thumbColor="#fff"
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Sign Out */}
      <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
        <TouchableOpacity
          style={[styles.signOutBtn, { backgroundColor: QColors.errorLight }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color={QColors.error} />
          <Text style={[styles.signOutText, { color: QColors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.version, { color: colors.textTertiary }]}>
        QRomes v1.0.0 · Connecting the Roaming Souls
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    alignItems: "center",
    paddingBottom: 28,
    paddingHorizontal: 20,
    gap: 6,
    position: "relative",
  },
  settingsBtn: {
    position: "absolute",
    right: 20,
    top: 0,
    marginTop: 0,
  },
  avatarContainer: {
    position: "relative",
    marginTop: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: "#fff",
  },
  name: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginTop: 4,
  },
  location: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
  },
  coinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 4,
  },
  coinText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  addCoins: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  addCoinsText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: -16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  card: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  bioText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
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
  settingsGroup: {
    marginHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  groupTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingHorizontal: 4,
  },
  settingsCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  settingsIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  signOutText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  version: {
    textAlign: "center",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 20,
    marginBottom: 8,
  },
});
