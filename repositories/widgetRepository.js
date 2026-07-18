import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function createWidget({ ownerId, type, copy, fields, targeting }) {
  const result = await pool.query(
    `INSERT INTO widgets (owner_id, type, copy, fields, targeting)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [ownerId, type, JSON.stringify(copy), JSON.stringify(fields), JSON.stringify(targeting || {})]
  );
  return result.rows[0];
}

export async function findWidgetsByOwner(ownerId) {
  const result = await pool.query(
    "SELECT * FROM widgets WHERE owner_id = $1 ORDER BY created_at DESC",
    [ownerId]
  );
  return result.rows;
}

export async function findWidgetById(id) {
  const result = await pool.query("SELECT * FROM widgets WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function updateWidget(id, { copy, fields, targeting }) {
  const result = await pool.query(
    `UPDATE widgets
     SET copy = $1, fields = $2, targeting = $3, version = version + 1, updated_at = NOW()
     WHERE id = $4 RETURNING *`,
    [JSON.stringify(copy), JSON.stringify(fields), JSON.stringify(targeting), id]
  );
  return result.rows[0];
}

export async function deleteWidget(id) {
  await pool.query("DELETE FROM widgets WHERE id = $1", [id]);
}