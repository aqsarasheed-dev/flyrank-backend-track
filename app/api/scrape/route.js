import { scrapeBooks } from "@/services/scraperService";
import { saveBooks, findAllScrapedBooks } from "@/repositories/scrapedBookRepository";

export async function POST() {
  try {
    const books = await scrapeBooks(3);
    await saveBooks(books);
    return Response.json({ success: true, count: books.length, data: books });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const books = await findAllScrapedBooks();
    return Response.json({ success: true, data: books });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}