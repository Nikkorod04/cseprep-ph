import { router } from "expo-router";
import {
  QUESTION_BY_ID,
  questionsFor,
  SECTION_BY_ID,
  topicName,
} from "@/lib/content";
import type { Question, SectionId, Track } from "@/lib/content/types";
import { getBookmarkedIds, getMissedQuestionIds } from "@/lib/db";
import { todayKey } from "@/lib/daily";
import { useSession } from "@/lib/store/session";
import { useSettings } from "@/lib/store/settings";
import {
  BLUEPRINT,
  mockSeconds,
  newSessionId,
  sample,
} from "./engine";
import { buildDailyChallenge } from "./daily";

export interface StartPracticeOptions {
  section?: SectionId;
  topic?: string;
  count?: number;
  title?: string;
  subtitle?: string;
  /** Replace the current screen instead of pushing (used from results). */
  replace?: boolean;
}

export function startPractice(options: StartPracticeOptions = {}): boolean {
  const track = useSettings.getState().track;
  const pool = questionsFor(track, {
    section: options.section,
    topic: options.topic,
  });
  if (pool.length === 0) return false;

  const items = sample(pool, options.count ?? 10);
  const sectionLabel = options.section
    ? SECTION_BY_ID.get(options.section)?.short
    : undefined;

  const title =
    options.title ??
    (options.section && options.topic
      ? topicName(options.section, options.topic)
      : sectionLabel
        ? `${sectionLabel} practice`
        : "Mixed practice");

  useSession.getState().start(
    {
      id: newSessionId(),
      mode: "practice",
      track,
      title,
      subtitle: options.subtitle,
      section: options.section,
      topic: options.topic,
      count: items.length,
    },
    items,
  );

  router[options.replace ? "replace" : "push"]("/session");
  return true;
}

/**
 * Browse mode: every item in a topic, in a stable order, with the answer
 * hidden until the reader asks for it. Nothing is scored or recorded.
 */
export function startStudy(
  options: { section?: SectionId; topic?: string; title?: string } = {},
): boolean {
  const track = useSettings.getState().track;
  const pool = questionsFor(track, {
    section: options.section,
    topic: options.topic,
  });
  if (pool.length === 0) return false;

  const items = [...pool].sort((a, b) => a.id.localeCompare(b.id));
  const sectionLabel = options.section
    ? SECTION_BY_ID.get(options.section)?.short
    : undefined;

  const title =
    options.title ??
    (options.section && options.topic
      ? topicName(options.section, options.topic)
      : sectionLabel
        ? `${sectionLabel} study`
        : "Study");

  useSession.getState().start(
    {
      id: newSessionId(),
      mode: "study",
      track,
      title,
      subtitle: `${items.length} items · read at your pace`,
      section: options.section,
      topic: options.topic,
      count: items.length,
    },
    items,
  );

  router.push("/session");
  return true;
}

export function startBookmarkStudy(): boolean {
  const track = useSettings.getState().track;
  const items = getBookmarkedIds(100)
    .map((id) => QUESTION_BY_ID.get(id))
    .filter((q): q is Question => Boolean(q));

  if (items.length === 0) return false;

  useSession.getState().start(
    {
      id: newSessionId(),
      mode: "study",
      track,
      title: "Saved questions",
      subtitle: `${items.length} bookmarked · read at your pace`,
      count: items.length,
    },
    items,
  );

  router.push("/session");
  return true;
}

export function startMissedPractice(): boolean {
  const track = useSettings.getState().track;
  const items = getMissedQuestionIds(50)
    .map((id) => QUESTION_BY_ID.get(id))
    .filter(
      (q): q is Question => q !== undefined && q.tracks.includes(track),
    )
    .slice(0, 20);

  if (items.length === 0) return false;

  useSession.getState().start(
    {
      id: newSessionId(),
      mode: "practice",
      track,
      title: "Missed items",
      subtitle: `${items.length} items collected from your error log`,
      count: items.length,
    },
    items,
  );

  router.push("/session");
  return true;
}

export function startDailyChallenge(): boolean {
  const track = useSettings.getState().track;
  const key = todayKey();
  const items = buildDailyChallenge(track, key);
  if (items.length === 0) return false;

  useSession.getState().start(
    {
      id: newSessionId(),
      mode: "daily",
      track,
      title: "Daily challenge",
      subtitle: `${items.length} mixed items · ${key}`,
      count: items.length,
      daily: key,
    },
    items,
  );

  router.push("/session");
  return true;
}

export function buildMock(track: Track): Question[] {
  const out: Question[] = [];
  const used = new Set<string>();

  for (const row of BLUEPRINT[track]) {
    const pool = questionsFor(track, { section: row.section }).filter(
      (q) => !used.has(q.id),
    );
    for (const item of sample(pool, row.count)) {
      out.push(item);
      used.add(item.id);
    }
  }

  return out;
}

export function startMock(): boolean {
  const track = useSettings.getState().track;
  const items = buildMock(track);
  if (items.length === 0) return false;

  const seconds = mockSeconds(track, items.length);
  const minutes = Math.round(seconds / 60);

  useSession.getState().start(
    {
      id: newSessionId(),
      mode: "mock",
      track,
      title: "Mock exam",
      subtitle: `${items.length} items · ${minutes} min · pass at 80%`,
      count: items.length,
      seconds,
      endsAt: Date.now() + seconds * 1000,
    },
    items,
  );

  router.push("/session");
  return true;
}

export function startDiagnostic(options: { replace?: boolean } = {}): boolean {
  const track = useSettings.getState().track;
  const pool = questionsFor(track);
  if (pool.length === 0) return false;

  const items = sample(pool, 10);
  useSession.getState().start(
    {
      id: newSessionId(),
      mode: "diagnostic",
      track,
      title: "Diagnostic",
      subtitle: "10 mixed items · untimed",
      count: items.length,
    },
    items,
  );

  router[options.replace ? "replace" : "push"]("/session");
  return true;
}
