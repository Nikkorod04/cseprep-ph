export const SCHEMA = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL,
  track TEXT NOT NULL,
  section TEXT,
  topic TEXT,
  started_at INTEGER NOT NULL,
  finished_at INTEGER,
  total INTEGER NOT NULL,
  correct INTEGER,
  duration_ms INTEGER
);

CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  section TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  selected TEXT,
  correct INTEGER NOT NULL,
  ms INTEGER NOT NULL,
  mode TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_attempts_topic ON attempts(topic, created_at);
CREATE INDEX IF NOT EXISTS idx_attempts_question ON attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_created ON attempts(created_at);

CREATE TABLE IF NOT EXISTS mock_results (
  id TEXT PRIMARY KEY,
  track TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  finished_at INTEGER NOT NULL,
  rating REAL NOT NULL,
  passed INTEGER NOT NULL,
  breakdown TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookmarks (
  question_id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id TEXT NOT NULL,
  reason TEXT,
  created_at INTEGER NOT NULL,
  synced INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;
