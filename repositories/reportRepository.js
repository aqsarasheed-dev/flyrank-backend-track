import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function createReport(jobId) {
  const result = await pool.query(
    `INSERT INTO reports (job_id, status) VALUES ($1, 'queued') RETURNING *`,
    [jobId]
  );
  return result.rows[0];
}

export async function findReportById(id) {
  const result = await pool.query("SELECT * FROM reports WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function updateReport(id, { status, filePath, error }) {
  await pool.query(
    `UPDATE reports
     SET status = $1, file_path = $2, error = $3,
         completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE completed_at END
     WHERE id = $4`,
    [status, filePath || null, error || null, id]
  );
}

// Aggregated stats from your scraped_books table, for the report content
export async function getBookStats() {
  const totalResult = await pool.query("SELECT COUNT(*) as total, AVG(price) as avg_price FROM scraped_books");
  const byRatingResult = await pool.query(
    "SELECT rating, COUNT(*) as count FROM scraped_books GROUP BY rating ORDER BY rating"
  );
  const topExpensiveResult = await pool.query(
    "SELECT title, price FROM scraped_books ORDER BY price DESC LIMIT 5"
  );

  return {
    totalBooks: parseInt(totalResult.rows[0].total, 10),
    avgPrice: parseFloat(totalResult.rows[0].avg_price).toFixed(2),
    byRating: byRatingResult.rows,
    topExpensive: topExpensiveResult.rows,
  };
}