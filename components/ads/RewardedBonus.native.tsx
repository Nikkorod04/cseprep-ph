import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ADS_ENABLED, AD_UNITS } from "@/lib/ads/config";
import { colors, spacing } from "@/theme/tokens";

const COUNT_KEY = "cseprep.ads.rewardedCount";
const DAY_KEY = "cseprep.ads.rewardedDay";
const DAILY_CAP = 3;

type Status = "loading" | "ready" | "showing" | "error" | "capped";

interface Props {
  onReward: () => void;
}

/**
 * Native-only card. Rendered only when the AdMob module exists, so Expo Go
 * and web show nothing at all.
 */
export function RewardedBonus({ onReward }: Props) {
  const [status, setStatus] = useState<Status>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const adRef = useRef<any>(null);
  const onRewardRef = useRef(onReward);
  onRewardRef.current = onReward;

  useEffect(() => {
    if (!ADS_ENABLED) return;

    let cancelled = false;
    const unsubs: Array<() => void> = [];

    try {
      const ads = require("react-native-google-mobile-ads");
      const ad = ads.RewardedAd.createForAdRequest(AD_UNITS.rewarded, {
        requestNonPersonalizedAdsOnly: true,
      });
      adRef.current = ad;

      unsubs.push(
        ad.addAdEventListener(ads.RewardedAdEventType.LOADED, () => {
          if (!cancelled) setStatus("ready");
        }),
        ad.addAdEventListener(ads.RewardedAdEventType.EARNED_REWARD, () => {
          onRewardRef.current();
        }),
        ad.addAdEventListener(ads.AdEventType.CLOSED, () => {
          adRef.current = null;
          if (!cancelled) {
            setStatus("loading");
            setReloadKey((key) => key + 1);
          }
        }),
        ad.addAdEventListener(ads.AdEventType.ERROR, () => {
          adRef.current = null;
          if (!cancelled) setStatus("error");
        }),
      );

      ad.load();
    } catch {
      setStatus("error");
    }

    return () => {
      cancelled = true;
      unsubs.forEach((unsubscribe) => unsubscribe());
      adRef.current = null;
    };
  }, [reloadKey]);

  if (!ADS_ENABLED) return null;

  async function show() {
    if (!adRef.current || status !== "ready") return;

    try {
      const today = new Date().toDateString();
      const [dayRaw, countRaw] = await Promise.all([
        AsyncStorage.getItem(DAY_KEY),
        AsyncStorage.getItem(COUNT_KEY),
      ]);
      const count = dayRaw === today ? Number(countRaw) || 0 : 0;
      if (count >= DAILY_CAP) {
        setStatus("capped");
        return;
      }

      setStatus("showing");
      adRef.current.show();

      await AsyncStorage.multiSet([
        [COUNT_KEY, String(count + 1)],
        [DAY_KEY, today],
      ]);
    } catch {
      setStatus("error");
    }
  }

  const label =
    status === "ready"
      ? "Watch ad · +10 items"
      : status === "error"
        ? "Ad unavailable"
        : status === "capped"
          ? "Daily limit reached"
          : status === "showing"
            ? "Playing ad…"
            : "Loading ad…";

  return (
    <Card style={styles.card}>
      <AppText variant="tiny" color={colors.gold}>
        BONUS SET
      </AppText>
      <AppText variant="heading">Want 10 more items?</AppText>
      <AppText variant="small" color={colors.muted}>
        Watch a short ad to unlock a bonus practice set.
      </AppText>
      <Button
        label={label}
        icon={status === "ready" ? "play" : undefined}
        disabled={status !== "ready"}
        onPress={() => void show()}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm, marginTop: spacing.lg },
});
