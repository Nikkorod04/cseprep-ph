import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type { Track } from "@/lib/content/types";

const KEY = "cseprep.settings.v1";

export interface SettingsData {
  onboarded: boolean;
  track: Track;
  examDate: string | null;
  dailyGoal: number;
  remindersEnabled: boolean;
  reminderHour: number;
}

interface SettingsState extends SettingsData {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setTrack: (track: Track) => void;
  setExamDate: (date: string | null) => void;
  setDailyGoal: (goal: number) => void;
  setReminders: (enabled: boolean) => void;
  completeOnboarding: () => void;
  reset: () => Promise<void>;
}

const DEFAULTS: SettingsData = {
  onboarded: false,
  track: "professional",
  examDate: "2027-03-14",
  dailyGoal: 10,
  remindersEnabled: false,
  reminderHour: 19,
};

function snapshot(state: SettingsState): SettingsData {
  return {
    onboarded: state.onboarded,
    track: state.track,
    examDate: state.examDate,
    dailyGoal: state.dailyGoal,
    remindersEnabled: state.remindersEnabled,
    reminderHour: state.reminderHour,
  };
}

async function persist(state: SettingsState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(snapshot(state)));
  } catch {
    // Settings are best-effort; never block the UI on storage.
  }
}

export const useSettings = create<SettingsState>()((set, get) => ({
  ...DEFAULTS,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SettingsData>;
        set({ ...DEFAULTS, ...parsed, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },

  setTrack: (track) => {
    set({ track });
    void persist(get());
  },
  setExamDate: (examDate) => {
    set({ examDate });
    void persist(get());
  },
  setDailyGoal: (dailyGoal) => {
    set({ dailyGoal });
    void persist(get());
  },
  setReminders: (remindersEnabled) => {
    set({ remindersEnabled });
    void persist(get());
  },
  completeOnboarding: () => {
    set({ onboarded: true });
    void persist(get());
  },
  reset: async () => {
    set({ ...DEFAULTS, hydrated: true });
    try {
      await AsyncStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  },
}));
