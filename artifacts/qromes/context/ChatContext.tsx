import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Message = {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  type: "text" | "emoji" | "gif";
  isRead: boolean;
};

export type Conversation = {
  id: string;
  participantId: string;
  participantName: string;
  participantAge: number;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
};

type ChatContextValue = {
  conversations: Conversation[];
  addMessage: (convId: string, text: string, senderId: string) => void;
  markRead: (convId: string) => void;
  getConversation: (id: string) => Conversation | undefined;
  createOrGetConversation: (profile: {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    isOnline: boolean;
  }) => string;
};

const ChatContext = createContext<ChatContextValue | null>(null);

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv1",
    participantId: "1",
    participantName: "Sofia M.",
    participantAge: 24,
    lastMessage: "That sounds amazing! When are you thinking?",
    lastMessageTime: Date.now() - 300000,
    unreadCount: 2,
    isOnline: true,
    messages: [
      {
        id: "m1",
        text: "Hey! I saw we matched. Love your art work!",
        senderId: "me",
        timestamp: Date.now() - 600000,
        type: "text",
        isRead: true,
      },
      {
        id: "m2",
        text: "Thank you so much! Are you into art too?",
        senderId: "1",
        timestamp: Date.now() - 540000,
        type: "text",
        isRead: true,
      },
      {
        id: "m3",
        text: "Yeah! I was thinking we could visit the Picasso museum sometime",
        senderId: "me",
        timestamp: Date.now() - 480000,
        type: "text",
        isRead: true,
      },
      {
        id: "m4",
        text: "That sounds amazing! When are you thinking?",
        senderId: "1",
        timestamp: Date.now() - 300000,
        type: "text",
        isRead: false,
      },
    ],
  },
  {
    id: "conv2",
    participantId: "2",
    participantName: "Arjun K.",
    participantAge: 27,
    lastMessage: "Let's do a video call sometime!",
    lastMessageTime: Date.now() - 3600000,
    unreadCount: 0,
    isOnline: true,
    messages: [
      {
        id: "m5",
        text: "Hello from Mumbai!",
        senderId: "2",
        timestamp: Date.now() - 7200000,
        type: "text",
        isRead: true,
      },
      {
        id: "m6",
        text: "Hey! That's so cool, I've always wanted to visit",
        senderId: "me",
        timestamp: Date.now() - 7000000,
        type: "text",
        isRead: true,
      },
      {
        id: "m7",
        text: "Let's do a video call sometime!",
        senderId: "2",
        timestamp: Date.now() - 3600000,
        type: "text",
        isRead: true,
      },
    ],
  },
  {
    id: "conv3",
    participantId: "3",
    participantName: "Emma R.",
    participantAge: 22,
    lastMessage: "Haha you're hilarious",
    lastMessageTime: Date.now() - 86400000,
    unreadCount: 1,
    isOnline: false,
    messages: [
      {
        id: "m8",
        text: "Haha you're hilarious",
        senderId: "3",
        timestamp: Date.now() - 86400000,
        type: "text",
        isRead: false,
      },
    ],
  },
];

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] =
    useState<Conversation[]>(MOCK_CONVERSATIONS);

  useEffect(() => {
    AsyncStorage.getItem("@qromes_conversations").then((v) => {
      if (v) setConversations(JSON.parse(v));
    });
  }, []);

  const addMessage = (convId: string, text: string, senderId: string) => {
    const newMsg: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text,
      senderId,
      timestamp: Date.now(),
      type: "text",
      isRead: senderId === "me",
    };
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== convId) return c;
        return {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessage: text,
          lastMessageTime: Date.now(),
          unreadCount: senderId !== "me" ? c.unreadCount + 1 : c.unreadCount,
        };
      });
      AsyncStorage.setItem("@qromes_conversations", JSON.stringify(updated));
      return updated;
    });
  };

  const markRead = (convId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              unreadCount: 0,
              messages: c.messages.map((m) => ({ ...m, isRead: true })),
            }
          : c
      )
    );
  };

  const getConversation = (id: string) =>
    conversations.find((c) => c.id === id);

  const createOrGetConversation = (profile: {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    isOnline: boolean;
  }): string => {
    const existing = conversations.find((c) => c.participantId === profile.id);
    if (existing) return existing.id;

    const newId = "conv_" + profile.id + "_" + Date.now();
    const newConv: Conversation = {
      id: newId,
      participantId: profile.id,
      participantName: profile.firstName + (profile.lastName ? " " + profile.lastName[0] + "." : ""),
      participantAge: profile.age,
      lastMessage: "Say hi! 👋",
      lastMessageTime: Date.now(),
      unreadCount: 0,
      isOnline: profile.isOnline,
      messages: [],
    };
    setConversations((prev) => {
      const updated = [newConv, ...prev];
      AsyncStorage.setItem("@qromes_conversations", JSON.stringify(updated));
      return updated;
    });
    return newId;
  };

  return (
    <ChatContext.Provider
      value={{ conversations, addMessage, markRead, getConversation, createOrGetConversation }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
