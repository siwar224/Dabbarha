import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { SetupProvider } from "@/context/SetupContext";

export default function RootLayout() {
  return (
    <SetupProvider>
      <StatusBar style="dark" />
      <Stack initialRouteName="splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="setup" />
        <Stack.Screen name="monthly/edit" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="goal/add" />
        <Stack.Screen name="goal/[id]" />
      </Stack>
    </SetupProvider>
  );
}
