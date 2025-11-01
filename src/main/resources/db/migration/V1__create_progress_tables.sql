-- Migration: create progress summary and practice attempts tables
-- Adjust types according to your DB (Postgres assumed)

CREATE TABLE IF NOT EXISTS user_chapter_success (
  user_id TEXT NOT NULL,
  chapter_id INT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, chapter_id)
);

CREATE INDEX IF NOT EXISTS idx_user_chapter_success_user ON user_chapter_success(user_id);

CREATE TABLE IF NOT EXISTS practice_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  chapter_id INT NOT NULL,
  at_ts TIMESTAMP WITH TIME ZONE DEFAULT now(),
  score_json JSONB,
  meta_json JSONB
);

CREATE INDEX IF NOT EXISTS idx_practice_attempts_user ON practice_attempts(user_id);
