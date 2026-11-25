import type {
  Question,
  SectionId,
  Track,
} from "@/lib/content/types";
import { SECTION_BY_ID, topicName } from "@/lib/content";
import type { AnswerRecord } from "@/lib/store/session";

export interface BlueprintRow {
  section: SectionId;
  count: number;
  minutes: number;
}

/** Working item allocation. CSC does not publish exact per-subtest counts. */
export const BLUEPRINT: Record<Track, BlueprintRow[]> = {
  professional: [
    { section: "verbal", count: 50, minutes: 57 },
    { section: "numerical", count: 40, minutes: 45 },
    { section: "analytical", count: 40, minutes: 45 },
    { section: "general-info", count: 20, minutes: 23 },
  ],
  subprofessional: [
    { section: "verbal", count: 50, minutes: 55 },
    { section: "numerical", count: 40, minutes: 44 },
    { section: "clerical", count: 35, minutes: 39 },
    { section: "general-info", count: 20, minutes: 22 },
  ],
};

export const EXAM_MINUTES: Record<Track, number> = {
  professional: 190,
  subprofessional: 160,
};

export function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i] as T;
    arr[i] = arr[j] as T;
    arr[j] = tmp;
  }
  return arr;
}

export function sample<T>(input: T[], n: number): T[] {
  if (n >= input.length) return shuffle(input);
  return shuffle(input).slice(0, Math.max(1, n));
}

export function newSessionId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function mockSeconds(track: Track, itemCount: number): number {
  const realItems = track === "professional" ? 170 : 165;
  const realSeconds = EXAM_MINUTES[track] * 60;
  return Math.round((realSeconds * itemCount) / realItems);
}

export function passTarget(total: number): number {
  return Math.ceil(total * 0.8);
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function formatStudyTime(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export interface BreakdownRow {
  key: string;
  label: string;
  correct: number;
  total: number;
}

export interface ScoreSummary {
  total: number;
  answered: number;
  correct: number;
  rating: number;
  passed: boolean;
  ms: number;
  bySection: BreakdownRow[];
  byTopic: BreakdownRow[];
}

export function scoreSession(
  items: Question[],
  answers: Record<string, AnswerRecord>,
): ScoreSummary {
  let correct = 0;
  let answered = 0;
  let ms = 0;

  const sectionMap = new Map<string, { label: string; correct: number; total: number }>();
  const topicMap = new Map<string, { label: string; correct: number; total: number }>();

  for (const item of items) {
    const record = answers[item.id];
    const isCorrect = Boolean(record?.correct);
    if (record?.selected) answered += 1;
    if (isCorrect) correct += 1;
    ms += record?.ms ?? 0;

    const section = sectionMap.get(item.section) ?? {
      label: SECTION_BY_ID.get(item.section)?.short ?? item.section,
      correct: 0,
      total: 0,
    };
    section.total += 1;
    section.correct += isCorrect ? 1 : 0;
    sectionMap.set(item.section, section);

    const topicKey = `${item.section}:${item.topic}`;
    const topic = topicMap.get(topicKey) ?? {
      label: topicName(item.section, item.topic),
      correct: 0,
      total: 0,
    };
    topic.total += 1;
    topic.correct += isCorrect ? 1 : 0;
    topicMap.set(topicKey, topic);
  }

  const total = items.length;
  const rating = total > 0 ? (correct / total) * 100 : 0;

  return {
    total,
    answered,
    correct,
    rating,
    passed: rating >= 80,
    ms,
    bySection: [...sectionMap.entries()].map(([key, value]) => ({
      key,
      ...value,
    })),
    byTopic: [...topicMap.entries()].map(([key, value]) => ({
      key,
      ...value,
    })),
  };
}

export function ratingMessage(rating: number): string {
  if (rating >= 90) return "Topnotcher pace. Keep this up.";
  if (rating >= 80) return "Passing level. Protect your weak spots.";
  if (rating >= 70) return "Close. Ten more points is one subtopic.";
  if (rating >= 55) return "Base is there. Drill the weak topics.";
  return "Start with the fundamentals, then run this again.";
}
