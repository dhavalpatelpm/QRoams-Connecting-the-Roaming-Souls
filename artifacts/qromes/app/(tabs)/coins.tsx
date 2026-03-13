import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QColors } from "@/constants/colors";
import { useTheme } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

const PACKS = [
  { id: "200", coins: 200, price: 19, emoji: "🪙", badge: null },
  { id: "700", coins: 700, price: 69, emoji: "🪙", badge: null },
  { id: "1000", coins: 1000, price: 119, emoji: "🪙", badge: "Best Value" },
  { id: "2000", coins: 2000, price: 299, emoji: "🪙🪙", badge: null },
  { id: "5000", coins: 5000, price: 599, emoji: "🪙🪙🪙", badge: null },
  { id: "8000", coins: 8000, price: 999, emoji: "💎", badge: "Power User 💎" },
];

const COIN_USES = [
  { icon: "call-outline", label: "Audio Call", cost: "5 coins / min" },
  { icon: "videocam-outline", label: "Video Call", cost: "10 coins / min" },
  { icon: "people-outline", label: "Propose Meet", cost: "20 coins" },
  { icon: "star-outline", label: "Super Like", cost: "10 coins" },
  { icon: "flash-outline", label: "Boost Profile", cost: "50 coins / hr" },
];

const TRANSACTIONS = [
  { id: "t1", label: "Video call with Sofia", coins: -15, date: "Today, 3:42 PM", type: "debit" },
  { id: "t2", label: "Purchased 1,000 coins", coins: 1000, date: "Yesterday, 11:15 AM", type: "credit" },
  { id: "t3", label: "Audio call with Arjun", coins: -10, date: "Yesterday, 9:00 AM", type: "debit" },
  { id: "t4", label: "Propose Meet to Emma", coins: -20, date: "Dec 12, 6:20 PM", type: "debit" },
];

export default function CoinsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { user, updateUser } = useAuth();
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const balance = user?.coinBalance ?? 100;

  const handleBuy = () => {
    const pack = PACKS.find((p) => p.id === selectedPack);
    if (!pack) {
      Alert.alert("Select a Pack", "Please choose a coin pack first.");
      return;
    }
    Alert.alert(
      `Buy ${pack.coins.toLocaleString()} coins`,
      `₹${pack.price} will be charged. Continue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Buy Now",
          onPress: () => {
            updateUser({ coinBalance: balance + pack.coins });
            Alert.alert("🎉 Purchased!", `${pack.coins.toLocaleString()} coins added to your balance.`);
            setSelectedPack(null);
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Coins</Text>
          <Text style={{ fontSize: 22 }}>🪙</Text>
        </View>
      </View>

      {/* Balance Card */}
      <View style={styles.balancePadding}>
        <LinearGradient
          colors={[QColors.primary, QColors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Your balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>{balance.toLocaleString()}</Text>
            <Text style={styles.balanceCoinLabel}>coins</Text>
          </View>
          <TouchableOpacity
            style={styles.historyLink}
            onPress={() => setShowHistory(!showHistory)}
          >
            <Text style={styles.historyLinkText}>Transaction History</Text>
            <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Transaction History */}
      {showHistory && (
        <View style={[styles.historyCard, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>RECENT TRANSACTIONS</Text>
          {TRANSACTIONS.map((t) => (
            <View key={t.id} style={[styles.txRow, { borderBottomColor: colors.border }]}>
              <View style={[
                styles.txIconBox,
                { backgroundColor: t.type === "credit" ? "#D1FAE5" : "#FEE2E2" }
              ]}>
                <Ionicons
                  name={t.type === "credit" ? "add" : "remove"}
                  size={16}
                  color={t.type === "credit" ? "#10B981" : "#EF4444"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.txLabel, { color: colors.text }]}>{t.label}</Text>
                <Text style={[styles.txDate, { color: colors.textTertiary }]}>{t.date}</Text>
              </View>
              <Text style={[
                styles.txAmount,
                { color: t.type === "credit" ? "#10B981" : "#EF4444" }
              ]}>
                {t.type === "credit" ? "+" : ""}{t.coins}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Choose Pack */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, paddingHorizontal: 20, marginBottom: 12 }]}>
        CHOOSE A PACK
      </Text>

      <View style={styles.packsGrid}>
        {PACKS.map((pack) => {
          const isSelected = selectedPack === pack.id;
          const isBestValue = pack.badge === "Best Value";
          const isPowerUser = pack.badge?.includes("Power User");
          const perCoin = (pack.price / pack.coins).toFixed(3);
          return (
            <TouchableOpacity
              key={pack.id}
              style={[
                styles.packCard,
                {
                  backgroundColor: isDark ? colors.backgroundSecondary : "#fff",
                  borderColor: isPowerUser
                    ? "#F59E0B"
                    : isBestValue
                    ? QColors.primary
                    : isSelected
                    ? QColors.primary
                    : isDark
                    ? colors.border
                    : "#E5E7EB",
                  borderWidth: isSelected || isBestValue || isPowerUser ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedPack(isSelected ? null : pack.id)}
              activeOpacity={0.8}
            >
              {pack.badge && (
                <View style={[
                  styles.packBadge,
                  { backgroundColor: isPowerUser ? "#F59E0B" : QColors.primary }
                ]}>
                  <Text style={styles.packBadgeText}>{pack.badge}</Text>
                </View>
              )}
              <Text style={styles.packEmoji}>{pack.emoji}</Text>
              <Text style={[styles.packCoins, { color: colors.text }]}>
                {pack.coins.toLocaleString()}
              </Text>
              <Text style={[styles.packCoinsLabel, { color: colors.textSecondary }]}>coins</Text>
              <Text style={styles.packPrice}>₹{pack.price}</Text>
              <Text style={[styles.perCoin, { color: colors.textTertiary }]}>₹{perCoin}/coin</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Buy Button */}
      <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
        <TouchableOpacity
          style={[styles.buyBtn, !selectedPack && { opacity: 0.5 }]}
          onPress={handleBuy}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[QColors.primary, QColors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="flash" size={20} color="#fff" />
          <Text style={styles.buyBtnText}>
            {selectedPack
              ? `Buy ${PACKS.find((p) => p.id === selectedPack)?.coins.toLocaleString()} Coins`
              : "Select a Pack to Buy"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* What coins get you */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, paddingHorizontal: 20, marginBottom: 10 }]}>
        WHAT COINS GET YOU
      </Text>
      <View style={[styles.usesCard, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
        {COIN_USES.map((use, i) => (
          <View key={use.label} style={[
            styles.useRow,
            { borderBottomColor: colors.border },
            i === COIN_USES.length - 1 && { borderBottomWidth: 0 }
          ]}>
            <View style={styles.useIcon}>
              <Ionicons name={use.icon as any} size={16} color={QColors.primary} />
            </View>
            <Text style={[styles.useLabel, { color: colors.text }]}>{use.label}</Text>
            <Text style={[styles.useCost, { color: QColors.primary }]}>{use.cost}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  balancePadding: { paddingHorizontal: 20, marginBottom: 24 },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    gap: 4,
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 4,
  },
  balanceAmount: {
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    lineHeight: 54,
  },
  balanceCoinLabel: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  historyLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  historyLinkText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.8)",
  },
  historyCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  txIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  txLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  txDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  txAmount: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  packsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  packCard: {
    width: "47%",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 2,
    position: "relative",
    overflow: "hidden",
  },
  packBadge: {
    position: "absolute",
    top: -1,
    left: "50%",
    transform: [{ translateX: -44 }],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 1,
  },
  packBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  packEmoji: {
    fontSize: 24,
    marginTop: 14,
    marginBottom: 4,
  },
  packCoins: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  packCoinsLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  packPrice: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#10B981",
    marginTop: 4,
  },
  perCoin: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  buyBtn: {
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buyBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  usesCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  useRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  useIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: QColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  useLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  useCost: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
