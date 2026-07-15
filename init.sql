-- Create the tasks table (matches your Service/Repository)
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample tasks so you have data to test with
INSERT INTO tasks (title, description) VALUES
  ('Learn Docker', 'Complete the BE-04 assignment'),
  ('Build API', 'Finish the backend routes')
ON CONFLICT (id) DO NOTHING;