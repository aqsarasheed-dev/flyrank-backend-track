import axios from "axios";
import * as cheerio from "cheerio";
import pLimit from "p-limit";

const BASE_URL = "https://books.toscrape.com";
const USER_AGENT = "FlyRankInternBot/1.0 (+educational scraping project; contact: aqsarasheed254@gmail.com)";
const DELAY_MS = 1000; // 1 second between requests — polite rate limiting
const limit = pLimit(1); // only 1 request at a time, no concurrency spam

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fetch and check robots.txt before scraping anything
export async function checkRobotsAllowed(path) {
  try {
    const { data } = await axios.get(`${BASE_URL}/robots.txt`, {
      headers: { "User-Agent": USER_AGENT },
    });

    const lines = data.split("\n").map((l) => l.trim());
    let disallowedPaths = [];
    let applies = false;

    for (const line of lines) {
      if (line.toLowerCase().startsWith("user-agent:")) {
        applies = line.toLowerCase().includes("*");
      }
      if (applies && line.toLowerCase().startsWith("disallow:")) {
        const value = line.split(":")[1]?.trim();
        if (value) disallowedPaths.push(value);
      }
    }

    const isDisallowed = disallowedPaths.some((p) => path.startsWith(p));
    return !isDisallowed;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // No robots.txt file exists — by convention this means no restrictions apply
      console.log("ℹ️  No robots.txt found — proceeding, no crawl restrictions specified.");
      return true;
    }
    // Any other error (network issue, etc.) — fail safe, don't scrape
    throw error;
  }
}

function cleanPrice(rawPrice) {
  // e.g. "£51.77" -> 51.77
  const numeric = rawPrice.replace(/[^0-9.]/g, "");
  return parseFloat(numeric);
}

function ratingWordToNumber(word) {
  const map = { One: 1, Two: 2, Three: 3, Four: 4, Five: 5 };
  return map[word] || null;
}

async function fetchPage(path) {
  await delay(DELAY_MS); // rate limit: wait before every request
  const response = await axios.get(`${BASE_URL}${path}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  return response.data;
}

function extractBooksFromListPage(html) {
  const $ = cheerio.load(html);
  const books = [];

  $("article.product_pod").each((_, el) => {
    const title = $(el).find("h3 a").attr("title")?.trim();
    const rawPrice = $(el).find(".price_color").text().trim();
    const ratingClass = $(el).find("p.star-rating").attr("class");
    const ratingWord = ratingClass?.split(" ")[1];
    const availability = $(el).find(".availability").text().trim();
    const detailPath = $(el).find("h3 a").attr("href");

    books.push({
      title,
      price: cleanPrice(rawPrice),
      rating: ratingWordToNumber(ratingWord),
      availability,
      detailPath,
    });
  });

  return books;
}

export async function scrapeBooks(pageCount = 3) {
  const allowed = await checkRobotsAllowed("/catalogue/");
  if (!allowed) {
    throw new Error("Scraping this path is disallowed by robots.txt");
  }

  const results = [];

  for (let page = 1; page <= pageCount; page++) {
    const path = page === 1 ? "/index.html" : `/catalogue/page-${page}.html`;
    console.log(`🕷️  Scraping page ${page}: ${path}`);

    const html = await limit(() => fetchPage(path));
    const books = extractBooksFromListPage(html);
    results.push(...books);
  }

  console.log(`✅ Scraped ${results.length} books total.`);
  return results;
}