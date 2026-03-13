import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QColors } from "@/constants/colors";
import { useTheme } from "@/constants/theme";
import { useChat, Message } from "@/context/ChatContext";

const AVATAR_COLORS = [
  ["#7C3AED", "#EC4899"],
  ["#EC4899", "#F59E0B"],
  ["#10B981", "#3B82F6"],
  ["#F59E0B", "#EF4444"],
];

function MessageBubble({ message, isMe }: { message: Message; isMe: boolean }) {
  const { isDark, colors } = useTheme();
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isMe) {
    return (
      <View style={styles.myBubbleContainer}>
        <View style={styles.myBubble}>
          <LinearGradient
            colors={[QColors.primary, QColors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.myBubbleText}>{message.text}</Text>
          <Text style={styles.myBubbleTime}>{time}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.theirBubbleContainer}>
      <View style={[styles.theirBubble, { backgroundColor: isDark ? colors.backgroundSecondary : "#F3F4F6" }]}>
        <Text style={[styles.theirBubbleText, { color: colors.text }]}>{message.text}</Text>
        <Text style={[styles.theirBubbleTime, { color: colors.textTertiary }]}>{time}</Text>
      </View>
    </View>
  );
}

const QUICK_REPLIES = ["Hey!", "That's cool!", "Tell me more", "Love that", "Same here!"];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getConversation, addMessage, markRead } = useChat();
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const conv = getConversation(id);

  React.useEffect(() => {
    if (conv) markRead(conv.id);
  }, [id]);

  const handleSend = () => {
    if (!text.trim() || !conv) return;
    addMessage(conv.id, text.trim(), "me");
    setText("");

    // Auto-reply after a moment
    setTimeout(() => {
      const replies = [
        "That's so interesting!",
        "I totally agree!",
        "Tell me more about that",
        "Haha, that's great!",
        "Really? That's awesome",
      ];
      addMessage(conv.id, replies[Math.floor(Math.random() * replies.length)], conv.participantId);
    }, 1500);
  };

  if (!conv) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, textAlign: "center", marginTop: 100 }}>
          Conversation not found
        </Text>
      </View>
    );
  }

  const gradColors = AVATAR_COLORS[parseInt(conv.participantId) % AVATAR_COLORS.length] as [string, string];
  const reversedMessages = [...conv.messages].reverse();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[QColors.primaryDark, QColors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <LinearGradient colors={[gradColors[0], gradColors[1]]} style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {conv.participantName.split(" ")[0][0]}
            {conv.participantName.split(" ")[1]?.[0] || ""}
          </Text>
        </LinearGradient>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{conv.participantName}</Text>
          <View style={styles.headerStatus}>
            {conv.isOnline && <View style={styles.onlineDot} />}
            <Text style={styles.headerStatusText}>
              {conv.isOnline ? "Online" : "Last seen recently"}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Ionicons name="call" size={20} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Ionicons name="videocam" size={20} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          data={reversedMessages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} isMe={item.senderId === "me"} />
          )}
          inverted
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />

        {/* Quick replies */}
        <View style={styles.quickRepliesRow}>
          <FlatList
            data={QUICK_REPLIES}
            keyExtractor={(q) => q}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 8, alignItems: "center" }}
            style={{ flexGrow: 0 }}
            renderItem={({ item: q }) => (
              <TouchableOpacity
                style={[styles.quickReply, { backgroundColor: isDark ? colors.backgroundSecondary : "#F0EEFF" }]}
                onPress={() => {
                  setText(q);
                  inputRef.current?.focus();
                }}
              >
                <Text style={[styles.quickReplyText, { color: isDark ? colors.text : QColors.primary }]}>{q}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Input */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB",
              paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 8,
              borderTopColor: isDark ? colors.border : "#E5E7EB",
            },
          ]}
        >
          <TouchableOpacity>
            <Ionicons name="add-circle-outline" size={26} color={colors.textTertiary} />
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.text, backgroundColor: isDark ? colors.backgroundTertiary : "#fff" }]}
            placeholder="Message..."
            placeholderTextColor={colors.textTertiary}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, text.trim().length === 0 && { opacity: 0.4 }]}
            onPress={handleSend}
            disabled={text.trim().length === 0}
          >
            <LinearGradient
              colors={[QColors.primary, QColors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  headerName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  headerStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  headerStatusText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  headerActions: {
    flexDirection: "row",
    gap: 4,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  myBubbleContainer: {
    alignItems: "flex-end",
    marginLeft: 60,
  },
  myBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    overflow: "hidden",
    maxWidth: "85%",
    gap: 3,
  },
  myBubbleText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  myBubbleTime: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    alignSelf: "flex-end",
  },
  theirBubbleContainer: {
    alignItems: "flex-start",
    marginRight: 60,
  },
  theirBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    maxWidth: "85%",
    gap: 3,
  },
  theirBubbleText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  theirBubbleTime: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    alignSelf: "flex-end",
  },
  quickRepliesRow: {
    height: 48,
    justifyContent: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  quickReply: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: QColors.primary + "35",
  },
  quickReplyText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    maxHeight: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
