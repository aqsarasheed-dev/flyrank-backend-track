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