import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

const SUGGESTIONS = [
  "How to start a conversation?",
  "Tips for first impression",
  "What to wear on a date?",
  "How to be confident?",
  "Conversation topics for dates",
  "How to ask someone out?",
  "Reading body language",
  "Overcoming shyness",
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
        .filter((m) => m.id !== "welcome" && !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_BASE}/qai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = data.content || "";

      if (!text) throw new Error("Empty response");

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: text,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I had trouble connecting. Tap **Retry** to try again.",
        isError: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 200);
    }
  };

  const retryLast = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setMessages((prev) => prev.filter((m) => !m.isError));
    sendMessage(lastUser.content);
  };

  const lastMessage = messages[messages.length - 1];
  const showSuggestions =
    !loading && lastMessage?.role === "assistant" && !lastMessage.isError;

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
              : [
                  styles.bubbleBot,
                  {
                    backgroundColor: item.isError
                      ? (isDark ? "#3B1A1A" : "#FEE2E2")
                      : (isDark ? colors.backgroundSecondary : "#F3F4F6"),
                  },
                ],
          ]}
        >
          {item.isError ? (
            <View style={{ gap: 8 }}>
              <Text style={[styles.bubbleText, { color: isDark ? "#FCA5A5" : "#DC2626" }]}>
                ⚠️ Couldn't reach Q-Coach right now.
              </Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={retryLast}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[QColors.primary, QColors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name="refresh" size={13} color="#fff" />
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={[styles.bubbleText, { color: isUser ? "#fff" : colors.text }]}>
              {item.content}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, backgroundColor: colors.background },
        ]}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Q-AI Coach
            </Text>
            <View
              style={[
                styles.poweredBadge,
                { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" },
              ]}
            >
              <View style={styles.groqDot} />
              <Text style={[styles.poweredText, { color: colors.textTertiary }]}>
                Powered by Groq
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
        contentContainerStyle={[styles.list, { paddingBottom: 8 }]}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: false })
        }
        ListHeaderComponent={
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
              Ask me anything about conversations, first impressions, date
              planning, or dressing well!
            </Text>
          </View>
        }
      />

      {/* Typing indicator */}
      {loading && (
        <View
          style={[
            styles.typingRow,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.botAvatar}>
            <LinearGradient
              colors={[QColors.primary, QColors.accent]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.botAvatarText}>Q</Text>
          </View>
          <View
            style={[
              styles.bubble,
              styles.bubbleBot,
              {
                backgroundColor: isDark
                  ? colors.backgroundSecondary
                  : "#F3F4F6",
              },
            ]}
          >
            <View style={styles.dotsRow}>
              <ActivityIndicator size="small" color={QColors.primary} />
              <Text style={[styles.typingText, { color: colors.textSecondary }]}>
                Q-Coach is thinking...
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Suggestions — shown after every AI answer */}
      {showSuggestions && (
        <View
          style={[
            styles.suggestionsWrap,
            { borderTopColor: colors.border },
          ]}
        >
          <Text style={[styles.suggestionsLabel, { color: colors.textTertiary }]}>
            Suggested questions
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsScroll}
          >
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.suggestionChip,
                  {
                    backgroundColor: isDark
                      ? colors.backgroundSecondary
                      : QColors.primaryLight,
                    borderColor: isDark
                      ? "rgba(124,58,237,0.3)"
                      : "#DDD6FE",
                  },
                ]}
                onPress={() => sendMessage(s)}
                activeOpacity={0.75}
              >
                <Text style={[styles.suggestionChipText, { color: QColors.primary }]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
        <View
          style={[
            styles.inputWrap,
            {
              backgroundColor: isDark ? colors.backgroundSecondary : "#F3F4F6",
            },
          ]}
        >
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
          style={[
            styles.sendBtn,
            (!input.trim() || loading) && { opacity: 0.5 },
          ]}
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
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  groqDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
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
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
  },
  retryText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  suggestionsWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 8,
  },
  suggestionsLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    paddingHorizontal: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  suggestionsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  suggestionChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
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
