import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
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

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

type Message = { id: string; role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "How to start a conversation?",
  "Tips for first impression",
  "What to wear on a date?",
  "How to be confident?",
];

const WELCOME_MSG: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hey! 👋 I'm your Q-Coach. Ask me anything about conversations, first impressions, date planning, or dressing well!",
};

export default function QAIScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const apiMessages = updatedMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_BASE}/qai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || "I'm having trouble connecting. Please try again.",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I couldn't connect right now. Please check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 150);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <LinearGradient
              colors={[QColors.primary, QColors.accent]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.botAvatarText}>Q</Text>
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser
              ? styles.bubbleUser
              : [styles.bubbleBot, { backgroundColor: isDark ? colors.backgroundSecondary : "#F3F4F6" }],
          ]}
        >
          <Text style={[styles.bubbleText, { color: isUser ? "#fff" : colors.text }]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  const showQuickPrompts = messages.length === 1;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.background }]}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Q-AI Coach</Text>
            <View style={styles.poweredBadge}>
              <Text style={[styles.poweredText, { color: colors.textTertiary }]}>
                Powered by Claude
              </Text>
            </View>
          </View>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            Your dating confidence guide
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: 16 },
        ]}
        ListHeaderComponent={
          <>
            {/* Bot Intro */}
            <View style={styles.introSection}>
              <View style={styles.botIconLarge}>
                <LinearGradient
                  colors={[QColors.primary, QColors.accent]}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.botIconEmoji}>🤖</Text>
              </View>
              <Text style={[styles.introTitle, { color: colors.text }]}>
                Hey! I'm your Q-Coach 👋
              </Text>
              <Text style={[styles.introSub, { color: colors.textSecondary }]}>
                Ask me anything about conversations, first impressions, date planning, or dressing well!
              </Text>
            </View>

            {/* Quick Prompts — show only at start */}
            {showQuickPrompts && (
              <View style={styles.promptsGrid}>
                {QUICK_PROMPTS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.promptChip,
                      { backgroundColor: isDark ? colors.backgroundSecondary : QColors.primaryLight },
                    ]}
                    onPress={() => sendMessage(p)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.promptChipText, { color: QColors.primary }]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        }
      />

      {/* Typing indicator */}
      {loading && (
        <View style={[styles.typingRow, { backgroundColor: colors.background }]}>
          <View style={styles.botAvatar}>
            <LinearGradient
              colors={[QColors.primary, QColors.accent]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.botAvatarText}>Q</Text>
          </View>
          <View style={[styles.bubble, styles.bubbleBot, { backgroundColor: isDark ? colors.backgroundSecondary : "#F3F4F6" }]}>
            <ActivityIndicator size="small" color={QColors.primary} />
          </View>
        </View>
      )}

      {/* Input Bar */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        <View style={[
          styles.inputWrap,
          { backgroundColor: isDark ? colors.backgroundSecondary : "#F3F4F6" }
        ]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Ask your Q-Coach..."
            placeholderTextColor={colors.textTertiary}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.5 }]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[QColors.primary, QColors.accent]}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  poweredBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 20,
  },
  poweredText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  introSection: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 8,
  },
  botIconLarge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  botIconEmoji: {
    fontSize: 36,
  },
  introTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  introSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  promptsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  promptChip: {
    width: "48%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  promptChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    lineHeight: 18,
  },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 12,
  },
  msgRowUser: {
    flexDirection: "row-reverse",
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  botAvatarText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: QColors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputWrap: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  input: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
