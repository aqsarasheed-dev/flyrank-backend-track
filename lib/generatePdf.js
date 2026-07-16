import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generateReportPdf(reportId, stats) {
  const dir = "/app/reports";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `report-${reportId}.pdf`);
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(20).text("Book Catalogue Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Generated: ${new Date().toISOString()}`);
  doc.moveDown();

  doc.fontSize(16).text("Summary");
  doc.fontSize(12).text(`Total books: ${stats.totalBooks}`);
  doc.text(`Average price: £${stats.avgPrice}`);
  doc.moveDown();

  doc.fontSize(16).text("Books by Rating");
  stats.byRating.forEach((r) => {
    doc.fontSize(12).text(`Rating ${r.rating}: ${r.count} books`);
  });
  doc.moveDown();

  doc.fontSize(16).text("Top 5 Most Expensive Books");
  stats.topExpensive.forEach((b, i) => {
    doc.fontSize(12).text(`${i + 1}. ${b.title} — £${b.price}`);
  });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}