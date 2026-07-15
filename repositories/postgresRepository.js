import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

console.log("🐘 Postgres Repository Initialized with DATABASE_URL");

export async function findAll() {
  console.log("📦 Repository: findAll() called");
  const result = await pool.query("SELECT * FROM tasks ORDER BY id ASC");
  return result.rows;
}

export async function findById(id) {
  console.log(`📦 Repository: findById(${id}) called`);
  const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [Number(id)]);
  return result.rows[0] || null;
}

export async function create({ title, description }) {
  console.log("📦 Repository: create() called");
  const result = await pool.query(
    "INSERT INTO tasks (title, description, done) VALUES ($1, $2, false) RETURNING *",
    [title, description]
  );
  return result.rows[0];
}