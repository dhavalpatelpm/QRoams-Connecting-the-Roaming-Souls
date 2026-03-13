import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QColors } from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";

function TabIcon({ name, focused }: { name: any; focused: boolean }) {
  return (
    <Ionicons
      name={name}
      size={24}
      color={focused ? QColors.primary : "#9CA3AF"}
    />
  );
}

export default function TabLayout() {
  const { isDark } = useThemeContext();
  const insets = useSafeAreaInsets();

  const tabBarBg = isDark ? "#0A0A0F" : "#FFFFFF";
  const borderColor = isDark ? "#2D2D3D" : "#E5E7EB";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: QColors.primary,
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Inter_500Medium",
          marginBottom: Platform.OS === "ios" ? 0 : 4,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "ios" ? "transparent" : tabBarBg,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: borderColor,
          elevation: 0,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={90}
              tint={isDark ? "dark" : "extraLight"}
              style={StyleSheet.absoluteFill}
            />
          ) : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "home" : "home-outline"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="session"
        options={{
          title: "Sessions",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "clipboard" : "clipboard-outline"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="meet"
        options={{
          title: "Meet",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "people" : "people-outline"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="coins"
        options={{
          title: "Coins",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "disc" : "disc-outline"}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="qai"
        options={{
          title: "Q-AI",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "hardware-chip" : "hardware-chip-outline"} focused={focused} />
          ),
        }}
      />

      {/* Hidden screens — routable but no tab entry */}
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
