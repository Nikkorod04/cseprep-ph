import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { ADS_ENABLED, AD_UNITS } from "@/lib/ads/config";
import { colors, spacing } from "@/theme/tokens";

type AdsModule = typeof import("react-native-google-mobile-ads");

let cached: AdsModule | null | undefined;

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

export function BannerSlot() {
  const ads = useMemo(() => loadAds(), []);

  if (!ads) return null;

  const { BannerAd, BannerAdSize } = ads;

  return (
    <View style={styles.wrap}>
      <BannerAd
        unitId={AD_UNITS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
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
