import { Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initDb } from "@/lib/db";
import { preloadInterstitial } from "@/lib/ads/interstitial";
import { useSettings } from "@/lib/store/settings";
import { colors } from "@/theme/tokens";

export default function RootLayout() {
  const hydrated = useSettings((s) => s.hydrated);
  const hydrate = useSettings((s) => s.hydrate);
  const segments = useSegments();
  const inTabs = segments[0] === "(tabs)";

  useEffect(() => {
    initDb();
    void hydrate();
    preloadInterstitial();
  }, [hydrate]);

  return (
    <SafeAreaProvider>
      <StatusBar style={inTabs ? "light" : "dark"} />
      {hydrated ? (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="onboarding"
            options={{ gestureEnabled: false, animation: "fade" }}
          />
          <Stack.Screen
            name="session/index"
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="session/results" options={{ gestureEnabled: false }} />
          <Stack.Screen name="tips/[slug]" />
        </Stack>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
});
