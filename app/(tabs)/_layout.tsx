import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import { colors } from "@/theme/colors";

type TabIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

function tabIcon(name: TabIconName) {
  return function TabBarIcon({
    color,
    size
  }: {
    color: string;
    size: number;
  }) {
    return <MaterialCommunityIcons name={name} color={color} size={size} />;
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 74,
          paddingBottom: 10,
          paddingTop: 8
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600"
        }
      }}
    >
      <Tabs.Screen
        name="accounts"
        options={{ title: "حساباتي", tabBarIcon: tabIcon("credit-card-outline") }}
      />
      <Tabs.Screen
        name="goals"
        options={{ title: "أهدافي", tabBarIcon: tabIcon("target") }}
      />
      <Tabs.Screen
        name="plan"
        options={{ title: "خطتي", tabBarIcon: tabIcon("format-list-bulleted") }}
      />
      <Tabs.Screen
        name="expense"
        options={{ title: "مصروف", tabBarIcon: tabIcon("plus-circle-outline") }}
      />
      <Tabs.Screen
        name="index"
        options={{ title: "الرئيسية", tabBarIcon: tabIcon("home") }}
      />
    </Tabs>
  );
}
