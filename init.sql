CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO tasks (title, description, done) VALUES
  ('Learn Docker', 'Containerize the stack', false),
  ('Learn Postgres', 'Persist data properly', false)
ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS scraped_books (
  id SERIAL PRIMARY KEY,
  title TEXT UNIQUE NOT NULL,
  price NUMERIC,
  rating INTEGER,
  availability TEXT,
  detail_path TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  idempotency_key TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'queued',
  input JSONB,
  result JSONB,
  error TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  job_id INTEGER,
  status TEXT NOT NULL DEFAULT 'queued',
  file_path TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS widgets (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  copy JSONB NOT NULL,
  fields JSONB NOT NULL,
  targeting JSONB DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  widget_id INTEGER NOT NULL REFERENCES widgets(id),
  data JSONB NOT NULL,
  ip TEXT,
  geo JSONB,
  spam_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);