import * as SQLite from "expo-sqlite";
import { SCHEMA } from "./schema";
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

let _db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase | null {
  if (!_db) {
    _db = SQLite.openDatabaseSync("cseprep.db");
    _db.execSync("PRAGMA journal_mode = WAL;");
    // Create tables immediately so the first screen can query safely.
    _db.execSync(SCHEMA);
  }
  return _db;
}

export function initDb(): void {
  getDb();
}

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function saveSession(input: SaveSessionInput): void {
  const db = getDb();
  if (!db) return;

  db.withTransactionSync(() => {
    db.runSync(
      `INSERT OR REPLACE INTO sessions
        (id, mode, track, section, topic, started_at, finished_at, total, correct, duration_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      input.id,
      input.mode,
      input.track,
      input.section ?? null,
      input.topic ?? null,
      input.startedAt,
      input.finishedAt,
      input.total,
      input.correct,
      input.durationMs,
    );

    for (const answer of input.answers) {
      db.runSync(
        `INSERT INTO attempts
          (question_id, session_id, section, topic, difficulty, selected, correct, ms, mode, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        answer.questionId,
        input.id,
        answer.section,
        answer.topic,
        answer.difficulty,
        answer.selected,
        answer.correct ? 1 : 0,
        answer.ms,
        input.mode,
        input.finishedAt,
      );
    }

    if (input.mock) {
      db.runSync(
        `INSERT OR REPLACE INTO mock_results
          (id, track, started_at, finished_at, rating, passed, breakdown)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        input.id,
        input.track,
        input.startedAt,
        input.finishedAt,
        input.mock.rating,
        input.mock.passed ? 1 : 0,
        input.mock.breakdown,
      );
    }
  });
}

export function getOverview(): Overview {
  const db = getDb();
  if (!db) return { total: 0, correct: 0, today: 0, ms: 0 };

  const row = db.getFirstSync<{
    total: number;
    correct: number;
    ms: number;
  }>(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(correct), 0) AS correct,
            COALESCE(SUM(ms), 0) AS ms
     FROM attempts`,
  );

  const today = db.getFirstSync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM attempts WHERE created_at >= ?`,
    startOfToday(),
  );

  return {
    total: row?.total ?? 0,
    correct: row?.correct ?? 0,
    today: today?.n ?? 0,
    ms: row?.ms ?? 0,
  };
}

export function getStreak(): number {
  const db = getDb();
  if (!db) return 0;

  const rows = db.getAllSync<{ d: string }>(
    `SELECT DISTINCT date(created_at / 1000, 'unixepoch', 'localtime') AS d
     FROM attempts
     ORDER BY d DESC`,
  );
  const days = new Set(rows.map((row) => row.d));

  const cursor = new Date();
  const key = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;

  // A streak may start today or yesterday.
  if (!days.has(key(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(key(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(key(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getTopicStats(): TopicStat[] {
  const db = getDb();
  if (!db) return [];
  return db.getAllSync<TopicStat>(
    `SELECT section,
            topic,
            COUNT(*) AS attempts,
            AVG(correct) * 100.0 AS accuracy
     FROM attempts
     GROUP BY section, topic
     ORDER BY accuracy ASC, attempts DESC`,
  );
}

export function getWeakTopics(limit = 3): TopicStat[] {
  return getTopicStats().slice(0, limit);
}

export function getRecentSessions(limit = 5): SessionRow[] {
  const db = getDb();
  if (!db) return [];
  return db.getAllSync<SessionRow>(
    `SELECT * FROM sessions
     WHERE finished_at IS NOT NULL
     ORDER BY finished_at DESC
     LIMIT ?`,
    limit,
  );
}

export function getMockResults(limit = 5): MockRow[] {
  const db = getDb();
  if (!db) return [];
  return db.getAllSync<MockRow>(
    `SELECT * FROM mock_results
     ORDER BY finished_at DESC
     LIMIT ?`,
    limit,
  );
}

export function getMissedQuestionIds(limit = 20): string[] {
  const db = getDb();
  if (!db) return [];
  const rows = db.getAllSync<{ question_id: string }>(
    `SELECT question_id, MAX(created_at) AS last_at
     FROM attempts
     WHERE correct = 0
     GROUP BY question_id
     ORDER BY last_at DESC
     LIMIT ?`,
    limit,
  );
  return rows.map((row) => row.question_id);
}

export function isBookmarked(questionId: string): boolean {
  const db = getDb();
  if (!db) return false;
  const row = db.getFirstSync<{ question_id: string }>(
    `SELECT question_id FROM bookmarks WHERE question_id = ?`,
    questionId,
  );
  return Boolean(row);
}

/** Returns the new bookmark state. */
export function toggleBookmark(questionId: string): boolean {
  const db = getDb();
  if (!db) return false;

  if (isBookmarked(questionId)) {
    db.runSync(`DELETE FROM bookmarks WHERE question_id = ?`, questionId);
    return false;
  }

  db.runSync(
    `INSERT OR REPLACE INTO bookmarks (question_id, created_at) VALUES (?, ?)`,
    questionId,
    Date.now(),
  );
  return true;
}

export function getBookmarkedIds(limit = 100): string[] {
  const db = getDb();
  if (!db) return [];
  return db
    .getAllSync<{ question_id: string }>(
      `SELECT question_id FROM bookmarks ORDER BY created_at DESC LIMIT ?`,
      limit,
    )
    .map((row) => row.question_id);
}

export function resetProgress(): void {
  const db = getDb();
  if (!db) return;
  db.withTransactionSync(() => {
    db.execSync(
      "DELETE FROM attempts; DELETE FROM sessions; DELETE FROM mock_results; DELETE FROM bookmarks;",
    );
  });
}
