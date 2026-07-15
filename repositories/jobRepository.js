import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function createJob({ idempotencyKey, input }) {
  const result = await pool.query(
    `INSERT INTO jobs (idempotency_key, input, status)
     VALUES ($1, $2, 'queued')
     ON CONFLICT (idempotency_key) DO NOTHING
     RETURNING *`,
    [idempotencyKey, input]
  );
  if (result.rows[0]) return result.rows[0];

  // Idempotency: if it already existed, return the existing job instead
  const existing = await pool.query(
    "SELECT * FROM jobs WHERE idempotency_key = $1",
    [idempotencyKey]
  );
  return existing.rows[0];
}

export async function findJobById(id) {
  const result = await pool.query("SELECT * FROM jobs WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function updateJobStatus(id, { status, result, error, attempts }) {
  await pool.query(
    `UPDATE jobs
     SET status = $1, result = $2, error = $3, attempts = $4, updated_at = NOW()
     WHERE id = $5`,
    [status, result || null, error || null, attempts, id]
  );
}