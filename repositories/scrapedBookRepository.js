import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function saveBooks(books) {
  for (const book of books) {
    await pool.query(
      `INSERT INTO scraped_books (title, price, rating, availability, detail_path)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (title) DO NOTHING`,
      [book.title, book.price, book.rating, book.availability, book.detailPath]
    );
  }
}

export async function findAllScrapedBooks() {
  const result = await pool.query("SELECT * FROM scraped_books ORDER BY id ASC");
  return result.rows;
}