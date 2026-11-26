import { questionsFor } from "@/lib/content";
import type { Question, SectionId, Track } from "@/lib/content/types";
import { todayKey } from "@/lib/daily";

const PLAN: Record<Track, { section: SectionId; count: number }[]> = {
  professional: [
    { section: "verbal", count: 4 },
    { section: "numerical", count: 3 },
    { section: "analytical", count: 2 },
    { section: "general-info", count: 1 },
  ],
  subprofessional: [
    { section: "verbal", count: 4 },
    { section: "numerical", count: 3 },
    { section: "clerical", count: 2 },
    { section: "general-info", count: 1 },
  ],
};

const TOTAL = 10;

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const random = mulberry32(hashSeed(seed));
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = result[i] as T;
    result[i] = result[j] as T;
    result[j] = tmp;
  }
  return result;
}

/**
 * Same 10 items for the same track and local date, regardless of when the
 * user opens the app. Different each day.
 */
export function buildDailyChallenge(
  track: Track,
  key: string = todayKey(),
): Question[] {
  const picked: Question[] = [];
  const used = new Set<string>();

  for (const row of PLAN[track]) {
    const pool = questionsFor(track, { section: row.section }).filter(
      (question) => !used.has(question.id),
    );
    const selection = seededShuffle(pool, `${key}:${row.section}`).slice(
      0,
      row.count,
    );
    for (const question of selection) {
      picked.push(question);
      used.add(question.id);
    }
  }

  if (picked.length < TOTAL) {
    const pool = questionsFor(track).filter(
      (question) => !used.has(question.id),
    );
    const fill = seededShuffle(pool, `${key}:fill`).slice(
      0,
      TOTAL - picked.length,
    );
    for (const question of fill) {
      picked.push(question);
      used.add(question.id);
    }
  }

  return seededShuffle(picked, `${key}:order`);
}
