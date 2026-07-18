import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function createSubmission({ widgetId, data, ip, geo, spamFlagged }) {
  const result = await pool.query(
    `INSERT INTO submissions (widget_id, data, ip, geo, spam_flagged)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [widgetId, JSON.stringify(data), ip, JSON.stringify(geo), spamFlagged]
  );
  return result.rows[0];
}

export async function findSubmissionsByWidgetOwner(ownerId) {
  const result = await pool.query(
    `SELECT s.* FROM submissions s
     JOIN widgets w ON s.widget_id = w.id
     WHERE w.owner_id = $1
     ORDER BY s.created_at DESC`,
    [ownerId]
  );
  return result.rows;
}
export async function getStatsForOwner(ownerId) {
  const totalResult = await pool.query(
    `SELECT COUNT(*) as total FROM submissions s
     JOIN widgets w ON s.widget_id = w.id
     WHERE w.owner_id = $1`,
    [ownerId]
  );

  const spamResult = await pool.query(
    `SELECT COUNT(*) as spam_count FROM submissions s
     JOIN widgets w ON s.widget_id = w.id
     WHERE w.owner_id = $1 AND s.spam_flagged = true`,
    [ownerId]
  );

  const byWidgetResult = await pool.query(
    `SELECT w.id as widget_id, w.type, COUNT(s.id) as submission_count
     FROM widgets w
     LEFT JOIN submissions s ON s.widget_id = w.id
     WHERE w.owner_id = $1
     GROUP BY w.id, w.type
     ORDER BY submission_count DESC`,
    [ownerId]
  );

  const byCountryResult = await pool.query(
    `SELECT s.geo->>'country' as country, COUNT(*) as count
     FROM submissions s
     JOIN widgets w ON s.widget_id = w.id
     WHERE w.owner_id = $1
     GROUP BY s.geo->>'country'
     ORDER BY count DESC`,
    [ownerId]
  );

  return {
    totalSubmissions: parseInt(totalResult.rows[0].total, 10),
    spamCount: parseInt(spamResult.rows[0].spam_count, 10),
    byWidget: byWidgetResult.rows,
    byCountry: byCountryResult.rows,
  };
}