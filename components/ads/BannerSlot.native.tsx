import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ADS_ENABLED, AD_UNITS } from "@/lib/ads/config";
import { colors, spacing } from "@/theme/tokens";

type AdsModule = typeof import("react-native-google-mobile-ads");

let cached: AdsModule | null | undefined;

const MAX_RETRIES = 2;
const RETRY_MS = 20000;

/**
 * Loads AdMob only when the native module is present (dev/production build).
 * `ADS_ENABLED` already checks TurboModuleRegistry, so Expo Go never reaches
 * the require call.
 */
function loadAds(): AdsModule | null {
  if (!ADS_ENABLED) return null;
  if (cached !== undefined) return cached;
  try {
    cached = require("react-native-google-mobile-ads") as AdsModule;
  } catch {
    cached = null;
  }
  return cached;
}

type Status = "loading" | "loaded" | "failed";

export function BannerSlot() {
  const ads = useMemo(() => loadAds(), []);
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);

  // A failed request leaves a zero-height view behind; retry quietly instead of
  // reserving an empty strip at the bottom of the screen.
  useEffect(() => {
    if (status !== "failed" || attempt >= MAX_RETRIES) return;
    const timer = setTimeout(() => {
      setStatus("loading");
      setAttempt((value) => value + 1);
    }, RETRY_MS);
    return () => clearTimeout(timer);
  }, [status, attempt]);

  if (!ads || status === "failed") return null;

  const { BannerAd, BannerAdSize } = ads;

  return (
    <View style={styles.wrap}>
      <BannerAd
        key={attempt}
        unitId={AD_UNITS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => setStatus("loaded")}
        onAdFailedToLoad={(error) => {
          if (__DEV__) {
            console.warn("[ads] banner failed", error?.message ?? error);
          }
          setStatus("failed");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    backgroundColor: colors.bg,
    paddingTop: spacing.xs,
  },
});
