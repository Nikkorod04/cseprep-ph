import Constants from "expo-constants";
import { Platform, TurboModuleRegistry } from "react-native";

const constants = Constants as unknown as {
  executionEnvironment?: string;
  appOwnership?: string | null;
};

/**
 * Expo Go has no AdMob native binary. Both checks are kept because
 * `executionEnvironment` has changed across SDK versions.
 */
export const IS_EXPO_GO =
  constants.executionEnvironment === "storeClient" ||
  constants.appOwnership === "expo";

/**
 * The definitive check: is the native AdMob module actually registered in
 * this binary? This is false in Expo Go and true in a dev/production build.
 */
function hasAdsNativeModule(): boolean {
  if (Platform.OS === "web") return false;
  try {
    return TurboModuleRegistry.get("RNGoogleMobileAdsModule") != null;
  } catch {
    return false;
  }
}

export const ADS_ENABLED = !IS_EXPO_GO && hasAdsNativeModule();

/** Google's official test units, per platform. */
const ANDROID_TEST = {
  banner: "ca-app-pub-3940256099942544/6300978111",
  interstitial: "ca-app-pub-3940256099942544/1033173712",
  rewarded: "ca-app-pub-3940256099942544/5224354917",
} as const;

const IOS_TEST = {
  banner: "ca-app-pub-3940256099942544/2934735716",
  interstitial: "ca-app-pub-3940256099942544/4411468910",
  rewarded: "ca-app-pub-3940256099942544/1712485313",
} as const;

const TEST = Platform.OS === "ios" ? IOS_TEST : ANDROID_TEST;

/**
 * Live Android units for CSE Prep PH. These are public identifiers, not
 * secrets. Env vars can override them if units are rotated.
 */
const ANDROID_LIVE = {
  banner:
    process.env.EXPO_PUBLIC_AD_BANNER ??
    "ca-app-pub-4143696379274937/6140593744",
  interstitial:
    process.env.EXPO_PUBLIC_AD_INTERSTITIAL ??
    "ca-app-pub-4143696379274937/2201348734",
  rewarded:
    process.env.EXPO_PUBLIC_AD_REWARDED ??
    "ca-app-pub-4143696379274937/7709339638",
} as const;

/**
 * No iOS AdMob app exists yet, so iOS falls back to test units even in
 * production. Replace these when the iOS app and units are created.
 */
const IOS_LIVE = IOS_TEST;

const LIVE = Platform.OS === "ios" ? IOS_LIVE : ANDROID_LIVE;

/**
 * Live units only in a production build that explicitly opts in.
 * `eas.json` sets EXPO_PUBLIC_ADS_MODE=live for the production profile.
 */
const USE_LIVE =
  process.env.EXPO_PUBLIC_ADS_MODE === "live" && !__DEV__;

export const AD_UNITS = USE_LIVE ? LIVE : TEST;
