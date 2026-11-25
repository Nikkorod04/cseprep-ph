import AsyncStorage from "@react-native-async-storage/async-storage";
import { ADS_ENABLED, AD_UNITS } from "./config";

const LAST_KEY = "cseprep.ads.lastInterstitial";
const COUNT_KEY = "cseprep.ads.interstitialCount";
const DAY_KEY = "cseprep.ads.interstitialDay";
const FIRST_KEY = "cseprep.ads.skippedFirstResult";
const COOLDOWN_MS = 3 * 60 * 1000;
const DAILY_CAP = 3;

let ad: any = null;
let loaded = false;
let loading = false;

/** Load the next interstitial in the background. Safe to call repeatedly. */
export function preloadInterstitial(): void {
  if (!ADS_ENABLED || ad || loading) return;

  try {
    const ads = require("react-native-google-mobile-ads");
    loading = true;
    ad = ads.InterstitialAd.createForAdRequest(AD_UNITS.interstitial, {
      requestNonPersonalizedAdsOnly: true,
    });

    ad.addAdEventListener(ads.AdEventType.LOADED, () => {
      loaded = true;
      loading = false;
    });
    ad.addAdEventListener(ads.AdEventType.ERROR, () => {
      loaded = false;
      loading = false;
      ad = null;
    });
    ad.addAdEventListener(ads.AdEventType.CLOSED, () => {
      loaded = false;
      loading = false;
      ad = null;
      setTimeout(preloadInterstitial, 1000);
    });

    ad.load();
  } catch {
    ad = null;
    loaded = false;
    loading = false;
  }
}

/**
 * Shows an interstitial only if all caps allow it:
 * - never on the first completed result
 * - at most once per 3 minutes
 * - at most 3 per calendar day
 */
export async function maybeShowInterstitial(): Promise<boolean> {
  if (!ADS_ENABLED) return false;

  preloadInterstitial();
  if (!loaded || !ad) return false;

  try {
    const first = await AsyncStorage.getItem(FIRST_KEY);
    if (!first) {
      await AsyncStorage.setItem(FIRST_KEY, "1");
      return false;
    }

    const today = new Date().toDateString();
    const [lastRaw, countRaw, dayRaw] = await Promise.all([
      AsyncStorage.getItem(LAST_KEY),
      AsyncStorage.getItem(COUNT_KEY),
      AsyncStorage.getItem(DAY_KEY),
    ]);

    const count = dayRaw === today ? Number(countRaw) || 0 : 0;
    if (count >= DAILY_CAP) return false;
    if (Date.now() - (Number(lastRaw) || 0) < COOLDOWN_MS) return false;

    await AsyncStorage.multiSet([
      [LAST_KEY, String(Date.now())],
      [COUNT_KEY, String(count + 1)],
      [DAY_KEY, today],
    ]);

    ad.show();
    return true;
  } catch {
    return false;
  }
}
