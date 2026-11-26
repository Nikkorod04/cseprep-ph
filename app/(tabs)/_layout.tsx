import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tapFeedback } from "@/lib/utils/haptics";
import { colors, font } from "@/theme/tokens";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

function tabIcon(active: IconName, inactive: IconName) {
  return ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <MaterialCommunityIcons
      name={focused ? active : inactive}
      size={size}
      color={typeof color === "string" ? color : undefined}
    />
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenListeners={{
        tabPress: () => tapFeedback("select"),
      }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: 72 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 8,
        },
        tabBarLabelStyle: {
          fontSize: font.tiny,
          fontWeight: "700",
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: tabIcon("home-variant", "home-variant-outline"),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: "Practice",
          tabBarIcon: tabIcon("pencil", "pencil-outline"),
        }}
      />
      <Tabs.Screen
        name="mock"
        options={{
          title: "Mock",
          tabBarIcon: tabIcon("timer", "timer-outline"),
        }}
      />
      <Tabs.Screen
        name="tips"
        options={{
          title: "Tips",
          tabBarIcon: tabIcon("lightbulb-on", "lightbulb-on-outline"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: tabIcon("account", "account-outline"),
        }}
      />
    </Tabs>
  );
}
