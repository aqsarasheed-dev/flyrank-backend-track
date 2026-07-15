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