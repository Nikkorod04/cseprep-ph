import questionsBase from "@/assets/content/v1/questions.json";
import questionsAnalogy from "@/assets/content/v1/questions-analogy.json";
import questionsAnalytical from "@/assets/content/v1/questions-analytical.json";
import questionsClerical from "@/assets/content/v1/questions-clerical.json";
import questionsClerical2 from "@/assets/content/v1/questions-clerical2.json";
import questionsGeneral from "@/assets/content/v1/questions-general.json";
import questionsNumerical from "@/assets/content/v1/questions-numerical.json";
import questionsParagraph from "@/assets/content/v1/questions-paragraph.json";
import questionsReading from "@/assets/content/v1/questions-reading.json";
import questionsVocab from "@/assets/content/v1/questions-vocab.json";
import questionsVerbal from "@/assets/content/v1/questions-verbal.json";
import sectionsJson from "@/assets/content/v1/sections.json";
import tipsJson from "@/assets/content/v1/tips.json";
import type {
  Question,
  SectionId,
  SectionMeta,
  TipArticle,
  Track,
} from "./types";

export const CONTENT_VERSION = 4;

export const QUESTIONS = [
  ...(questionsBase as unknown as Question[]),
  ...(questionsAnalogy as unknown as Question[]),
  ...(questionsAnalytical as unknown as Question[]),
  ...(questionsClerical as unknown as Question[]),
  ...(questionsClerical2 as unknown as Question[]),
  ...(questionsGeneral as unknown as Question[]),
  ...(questionsNumerical as unknown as Question[]),
  ...(questionsParagraph as unknown as Question[]),
  ...(questionsReading as unknown as Question[]),
  ...(questionsVocab as unknown as Question[]),
  ...(questionsVerbal as unknown as Question[]),
];
export const SECTIONS = sectionsJson as unknown as SectionMeta[];
export const TIPS = tipsJson as unknown as TipArticle[];

export const QUESTION_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));
export const SECTION_BY_ID = new Map(SECTIONS.map((s) => [s.id, s]));
export const TIP_BY_SLUG = new Map(TIPS.map((t) => [t.slug, t]));

export interface QuestionFilter {
  section?: SectionId;
  topic?: string;
}

/** Questions available for a track, optionally narrowed by section/topic. */
export function questionsFor(
  track: Track,
  filter: QuestionFilter = {},
): Question[] {
  return QUESTIONS.filter(
    (q) =>
      q.tracks.includes(track) &&
      (!filter.section || q.section === filter.section) &&
      (!filter.topic || q.topic === filter.topic),
  );
}

export function sectionMeta(id: SectionId): SectionMeta | undefined {
  return SECTION_BY_ID.get(id);
}

export function topicName(section: SectionId, topic: string): string {
  const meta = SECTION_BY_ID.get(section);
  return meta?.topics.find((t) => t.id === topic)?.name ?? topic;
}

/** Sections offered for a track: Professional has Analytical, Subpro has Clerical. */
export function sectionsForTrack(track: Track): SectionMeta[] {
  return SECTIONS.filter((s) =>
    s.id === "analytical"
      ? track === "professional"
      : s.id === "clerical"
        ? track === "subprofessional"
        : true,
  );
}

export function countFor(track: Track, section: SectionId): number {
  return questionsFor(track, { section }).length;
}

export function findTip(slug: string): TipArticle | undefined {
  return TIP_BY_SLUG.get(slug);
}
