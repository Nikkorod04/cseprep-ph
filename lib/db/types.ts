import type {
  ChoiceKey,
  SectionId,
  SessionMode,
  Track,
} from "@/lib/content/types";

export interface Overview {
  total: number;
  correct: number;
  today: number;
  ms: number;
}

export interface TopicStat {
  section: SectionId;
  topic: string;
  attempts: number;
  accuracy: number;
}

export interface SessionRow {
  id: string;
  mode: SessionMode;
  track: Track;
  section: SectionId | null;
  topic: string | null;
  started_at: number;
  finished_at: number | null;
  total: number;
  correct: number | null;
  duration_ms: number | null;
}

export interface MockRow {
  id: string;
  track: Track;
  started_at: number;
  finished_at: number;
  rating: number;
  passed: number;
  breakdown: string;
}

export interface AttemptInput {
  questionId: string;
  section: SectionId;
  topic: string;
  difficulty: number;
  selected: ChoiceKey | null;
  correct: boolean;
  ms: number;
}

export interface SaveSessionInput {
  id: string;
  mode: SessionMode;
  track: Track;
  section?: SectionId;
  topic?: string;
  startedAt: number;
  finishedAt: number;
  total: number;
  correct: number;
  durationMs: number;
  answers: AttemptInput[];
  mock?: { rating: number; passed: boolean; breakdown: string };
}
