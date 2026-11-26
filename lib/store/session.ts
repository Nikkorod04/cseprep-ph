import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { QUESTION_BY_ID } from "@/lib/content";
import type {
  ChoiceKey,
  Question,
  SectionId,
  SessionMode,
  Track,
} from "@/lib/content/types";

const KEY = "cseprep.activeSession.v1";

export interface SessionConfig {
  id: string;
  mode: SessionMode;
  track: Track;
  title: string;
  subtitle?: string;
  section?: SectionId;
  topic?: string;
  count: number;
  /** Local date key for the daily challenge, e.g. 2026-11-25. */
  daily?: string;
  /** Total seconds for the session, used for display. */
  seconds?: number;
  /** Absolute deadline while a timed session is running. */
  endsAt?: number;
  /** Seconds left when the session was paused, restored into endsAt on resume. */
  pausedRemaining?: number;
}

export interface AnswerRecord {
  questionId: string;
  selected: ChoiceKey | null;
  correct: boolean;
  ms: number;
}

export interface SavedSummary {
  config: SessionConfig;
  index: number;
  total: number;
  savedAt: number;
}

interface StoredShape {
  config: SessionConfig;
  itemIds: string[];
  index: number;
  answers: Record<string, AnswerRecord>;
  startedAt: number;
  savedAt: number;
}

interface SessionState {
  config: SessionConfig | null;
  items: Question[];
  index: number;
  answers: Record<string, AnswerRecord>;
  startedAt: number;
  finishedAt: number | null;
  start: (config: SessionConfig, items: Question[]) => void;
  select: (record: AnswerRecord) => void;
  next: () => void;
  prev: () => void;
  finish: () => void;
  reset: () => void;
}

const INITIAL = {
  config: null,
  items: [] as Question[],
  index: 0,
  answers: {} as Record<string, AnswerRecord>,
  startedAt: 0,
  finishedAt: null,
};

function freezeConfig(config: SessionConfig): SessionConfig {
  if (!config.endsAt) return config;
  const remaining = Math.max(0, Math.round((config.endsAt - Date.now()) / 1000));
  return { ...config, endsAt: undefined, pausedRemaining: remaining };
}

function write(state: SessionState, pauseClock = false): void {
  if (!state.config || state.items.length === 0) return;
  // Browsing is not progress: never overwrite a paused scored session with it.
  if (state.config.mode === "study") return;
  const payload: StoredShape = {
    config: pauseClock ? freezeConfig(state.config) : state.config,
    itemIds: state.items.map((q) => q.id),
    index: state.index,
    answers: state.answers,
    startedAt: state.startedAt,
    savedAt: Date.now(),
  };
  void AsyncStorage.setItem(KEY, JSON.stringify(payload)).catch(() => undefined);
}

export function clearSavedSession(): void {
  void AsyncStorage.removeItem(KEY).catch(() => undefined);
}

/**
 * Persist the current session and freeze any running clock so the user can
 * pick it up later without losing exam time.
 */
export function saveCurrentSession(): boolean {
  const state = useSession.getState();
  if (!state.config || state.finishedAt) return false;
  write(state, true);
  if (state.config.endsAt) {
    useSession.setState({ config: freezeConfig(state.config) });
  }
  return true;
}

export async function loadSavedSummary(): Promise<SavedSummary | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredShape;
    if (!data?.config || !Array.isArray(data.itemIds) || data.itemIds.length === 0) {
      return null;
    }
    return {
      config: data.config,
      index: Math.min(data.index ?? 0, data.itemIds.length - 1),
      total: data.itemIds.length,
      savedAt: data.savedAt ?? Date.now(),
    };
  } catch {
    return null;
  }
}

export async function restoreSession(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as StoredShape;
    const items = (data.itemIds ?? [])
      .map((id) => QUESTION_BY_ID.get(id))
      .filter((q): q is Question => Boolean(q));

    if (items.length === 0) {
      await AsyncStorage.removeItem(KEY);
      return false;
    }

    let config = data.config;
    if (typeof config.pausedRemaining === "number") {
      config = {
        ...config,
        endsAt: Date.now() + config.pausedRemaining * 1000,
        pausedRemaining: undefined,
      };
    }

    useSession.setState({
      config,
      items,
      index: Math.min(data.index ?? 0, items.length - 1),
      answers: data.answers ?? {},
      startedAt: data.startedAt ?? Date.now(),
      finishedAt: null,
    });
    return true;
  } catch {
    return false;
  }
}

export const useSession = create<SessionState>()((set, get) => ({
  ...INITIAL,

  start: (config, items) => {
    set({
      config,
      items,
      index: 0,
      answers: {},
      startedAt: Date.now(),
      finishedAt: null,
    });
    write(get(), true);
  },

  select: (record) => {
    set((state) => ({
      answers: { ...state.answers, [record.questionId]: record },
    }));
    write(get(), true);
  },

  next: () => {
    set((state) => ({ index: state.index + 1 }));
    write(get(), true);
  },

  prev: () => {
    set((state) => ({ index: Math.max(0, state.index - 1) }));
    write(get(), true);
  },

  finish: () => {
    set({ finishedAt: Date.now() });
    clearSavedSession();
  },

  reset: () => {
    const mode = get().config?.mode;
    set(INITIAL);
    if (mode !== "study") clearSavedSession();
  },
}));
