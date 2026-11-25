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
  SaveSessionInput,
  SessionRow,
  TopicStat,
} from "./types";

export type {
  AttemptInput,
  MockRow,
  Overview,
  SaveSessionInput,
  SessionRow,
  TopicStat,
} from "./types";

const BOOKMARK_KEY = "cseprep.bookmarks.web";

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
  return { total: 0, correct: 0, today: 0, ms: 0 };
}

export function getStreak(): number {
  return 0;
}

export function getTopicStats(): TopicStat[] {
  return [];
}

export function getWeakTopics(_limit = 3): TopicStat[] {
  return [];
}

export function getRecentSessions(_limit = 5): SessionRow[] {
  return [];
}

export function getMockResults(_limit = 5): MockRow[] {
  return [];
}

export function getMissedQuestionIds(_limit = 20): string[] {
  return [];
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

export function resetProgress(): void {
  try {
    localStorage.removeItem(BOOKMARK_KEY);
  } catch {
    // ignore
  }
}
