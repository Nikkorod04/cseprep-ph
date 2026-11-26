/**
 * Web stub. Metro resolves `index.native.ts` on iOS and Android.
 * Keeping expo-sqlite out of the web graph avoids the wa-sqlite worker build.
 *
 * Bookmarks are kept in localStorage so the browser preview still behaves
 * like the app for browsing, saving, and resuming study sets.
 */
import type {
  MockRow,
  Overview,
  ReportRow,
  SaveSessionInput,
  SessionRow,
  TopicStat,
} from "./types";

export type {
  AttemptInput,
  MockRow,
  Overview,
  ReportRow,
  SaveSessionInput,
  SessionRow,
  TopicStat,
} from "./types";

const BOOKMARK_KEY = "cseprep.bookmarks.web";
const REPORT_KEY = "cseprep.reports.web";
const DEMO_KEY = "cseprep.demo.v1";
const DEMO_ENABLED = process.env.EXPO_PUBLIC_DEMO === "1";

interface DemoData {
  overview?: Overview;
  streak?: number;
  topics?: TopicStat[];
  mocks?: MockRow[];
  sessions?: SessionRow[];
  missed?: string[];
}

function readDemo(): DemoData | null {
  if (!DEMO_ENABLED) return null;
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    return raw ? (JSON.parse(raw) as DemoData) : null;
  } catch {
    return null;
  }
}

function readBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function writeBookmarks(ids: string[]): void {
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function getDb(): null {
  return null;
}

export function initDb(): void {}

export function saveSession(_input: SaveSessionInput): void {}

export function getOverview(): Overview {
  return readDemo()?.overview ?? { total: 0, correct: 0, today: 0, ms: 0 };
}

export function getStreak(): number {
  return readDemo()?.streak ?? 0;
}

export function getTopicStats(): TopicStat[] {
  return readDemo()?.topics ?? [];
}

export function getWeakTopics(limit = 3): TopicStat[] {
  return getTopicStats()
    .slice()
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit);
}

export function getRecentSessions(limit = 5): SessionRow[] {
  return (readDemo()?.sessions ?? []).slice(0, limit);
}

export function getMockResults(limit = 5): MockRow[] {
  return (readDemo()?.mocks ?? []).slice(0, limit);
}

export function getMissedQuestionIds(limit = 20): string[] {
  return (readDemo()?.missed ?? []).slice(0, limit);
}

export function isBookmarked(questionId: string): boolean {
  return readBookmarks().includes(questionId);
}

export function toggleBookmark(questionId: string): boolean {
  const ids = readBookmarks();
  if (ids.includes(questionId)) {
    writeBookmarks(ids.filter((id) => id !== questionId));
    return false;
  }
  writeBookmarks([questionId, ...ids]);
  return true;
}

export function getBookmarkedIds(limit = 100): string[] {
  return readBookmarks().slice(0, limit);
}

function readReports(): ReportRow[] {
  try {
    const raw = localStorage.getItem(REPORT_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter(
          (row): row is ReportRow =>
            Boolean(row) &&
            typeof (row as ReportRow).question_id === "string" &&
            typeof (row as ReportRow).reason === "string",
        )
      : [];
  } catch {
    return [];
  }
}

function writeReports(rows: ReportRow[]): void {
  try {
    localStorage.setItem(REPORT_KEY, JSON.stringify(rows));
  } catch {
    // ignore
  }
}

export function isReported(questionId: string): boolean {
  return readReports().some((row) => row.question_id === questionId);
}

export function addReport(questionId: string, reason: string): void {
  const rows = readReports();
  if (
    rows.some(
      (row) => row.question_id === questionId && row.reason === reason,
    )
  ) {
    return;
  }
  const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  writeReports([
    { id: nextId, question_id: questionId, reason, created_at: Date.now() },
    ...rows,
  ]);
}

export function getReports(limit = 100): ReportRow[] {
  return readReports().slice(0, limit);
}

export function clearReports(): void {
  try {
    localStorage.removeItem(REPORT_KEY);
  } catch {
    // ignore
  }
}

export function resetProgress(): void {
  try {
    localStorage.removeItem(BOOKMARK_KEY);
  } catch {
    // ignore
  }
}
