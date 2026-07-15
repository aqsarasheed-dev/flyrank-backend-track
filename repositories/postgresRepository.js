// repositories/postgresRepository.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

console.log("🔍 Postgres Repository Initialized with DATABASE_URL");

// 1. Get all tasks
export async function findAll() {
  try {
    console.log("📦 Repository: findAll() called");
    const result = await pool.query('SELECT * FROM tasks ORDER BY id');
    return result.rows;
  } catch (error) {
    console.error("❌ Repository Error (findAll):", error.message);
    throw error;
  }
}

// 2. Get a single task by ID (This is the missing one!)
export async function findById(id) {
  try {
    console.log(`📦 Repository: findById(${id}) called`);
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ Repository Error (findById):", error.message);
    throw error;
  }
}

// 3. Create a new task
export async function create(data) {
  try {
    console.log("📦 Repository: create() called");
    const { title, description } = data;
    const result = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description || null]
    );
    return result.rows[0];
  } catch (error) {
    console.error("❌ Repository Error (create):", error.message);
    throw error;
  }
}

// 4. Update a task (if needed)
export async function update(id, data) {
  try {
    console.log(`📦 Repository: update(${id}) called`);
    const { title, description } = data;
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2 WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ Repository Error (update):", error.message);
    throw error;
  }
}

// 5. Delete a task (if needed)
export async function remove(id) {
  try {
    console.log(`📦 Repository: remove(${id}) called`);
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ Repository Error (remove):", error.message);
    throw error;
  }
}