import { ADS_ENABLED } from "./config";

let started = false;

/**
 * Kick AdMob initialization as early as possible. The SDK can initialize on
 * the first ad request, but doing it at boot makes the first banner use
 * warmed-up inventory. Safe to call repeatedly and a no-op in Expo Go.
 */
export function initAds(): void {
  if (!ADS_ENABLED || started) return;
  started = true;

  try {
    const ads = require("react-native-google-mobile-ads") as typeof import(
      "react-native-google-mobile-ads"
    );
    void ads.default()
      .initialize()
      .catch((error: unknown) => {
        if (__DEV__) console.warn("[ads] initialize failed", error);
      });
  } catch (error) {
    if (__DEV__) console.warn("[ads] native module unavailable", error);
  }
}
