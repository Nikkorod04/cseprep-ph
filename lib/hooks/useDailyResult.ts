import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getDailyResult, type DailyResult } from "@/lib/daily";

/** Today's completed daily result, refreshed whenever Home gains focus. */
export function useDailyResult(): DailyResult | null {
  const [result, setResult] = useState<DailyResult | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void getDailyResult().then((value) => {
        if (active) setResult(value);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  return result;
}
