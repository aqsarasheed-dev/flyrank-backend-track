const express = require('express');
const Database = require('better-sqlite3');

const app = express();
app.use(express.json());

// Stage 0: create database + table, seed 3 example tasks only on first run
const db = new Database('tasks.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT 0
  )
`);

const existingCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
if (existingCount === 0) {
  const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insert.run('Learn SQLite', 0);
  insert.run('Build CRUD API', 0);
  insert.run('Understand persistence', 0);
  console.log('Seeded 3 example tasks (first run only).');
}

// Stage 1: Read
app.get('/tasks', (req, res) => {
  const { search, done } = req.query;
  let query = 'SELECT * FROM tasks';
  const clauses = [];
  const params = [];

  if (search) {
    clauses.push('title LIKE ?');
    params.push(`%${search}%`);
  }
  if (done !== undefined) {
    clauses.push('done = ?');
    params.push(done === 'true' ? 1 : 0);
  }
  if (clauses.length > 0) {
    query += ' WHERE ' + clauses.join(' AND ');
  }
  query += ' ORDER BY title ASC';

  const tasks = db.prepare(query).all(...params);
  res.json(tasks);
});

app.get('/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// Extra: stats endpoint using SQL COUNT()
app.get('/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
  const completed = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE done = 1').get().count;
  res.json({ total, completed, pending: total - completed });
});

// Stage 2: Create
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const result = db.prepare('INSERT INTO tasks (title, done) VALUES (?, 0)').run(title);
  const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newTask);
});

// Stage 3: Update
app.put('/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  const { title, done } = req.body;
  db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(
    title ?? task.title,
    done !== undefined ? (done ? 1 : 0) : task.done,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Stage 3: Delete
app.delete('/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

const PORT = 3001; // different port from your main app, so both can run if needed
app.listen(PORT, () => {
  console.log(`BE-02 SQLite CRUD server running on http://localhost:${PORT}`);
});