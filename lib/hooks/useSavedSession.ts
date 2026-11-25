import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  loadSavedSummary,
  type SavedSummary,
} from "@/lib/store/session";

/** Reads the paused session summary every time the screen gains focus. */
export function useSavedSession(): SavedSummary | null {
  const [saved, setSaved] = useState<SavedSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void loadSavedSummary().then((summary) => {
        if (active) setSaved(summary);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  return saved;
}
