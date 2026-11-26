import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "cseprep.daily.v1";

export interface DailyResult {
  date: string;
  correct: number;
  total: number;
  rating: number;
  completedAt: number;
}

/** Local calendar day, so the challenge resets at the user's midnight. */
export function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getDailyResult(): Promise<DailyResult | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyResult;
    return parsed.date === todayKey() ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveDailyResult(result: DailyResult): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(result));
  } catch {
    // Progress is best-effort; never block the results screen.
  }
}
