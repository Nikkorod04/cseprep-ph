export type Track = "professional" | "subprofessional";

export type SectionId =
  | "verbal"
  | "numerical"
  | "analytical"
  | "clerical"
  | "general-info";

export type ChoiceKey = "A" | "B" | "C" | "D";

export type SessionMode = "practice" | "timed" | "mock" | "diagnostic" | "study";

export interface Choice {
  key: ChoiceKey;
  text: string;
}

export interface Question {
  id: string;
  tracks: Track[];
  section: SectionId;
  topic: string;
  difficulty: 1 | 2 | 3;
  stem: string;
  choices: Choice[];
  answer: ChoiceKey;
  explanation: string;
  tip?: string;
  version: number;
  reviewedAt: string;
}

export interface TopicMeta {
  id: string;
  name: string;
}

export interface SectionMeta {
  id: SectionId;
  name: string;
  short: string;
  blurb: string;
  topics: TopicMeta[];
}

export interface TipArticle {
  slug: string;
  title: string;
  section: SectionId | "general";
  minutes: number;
  summary: string;
  body: string;
}

export const CHOICE_KEYS: ChoiceKey[] = ["A", "B", "C", "D"];

export const TRACK_LABEL: Record<Track, string> = {
  professional: "Professional",
  subprofessional: "Subprofessional",
};

export const SECTION_ORDER: SectionId[] = [
  "verbal",
  "numerical",
  "analytical",
  "clerical",
  "general-info",
];
