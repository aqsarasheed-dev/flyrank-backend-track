import { reportQueue } from "@/lib/reportQueue";
import * as reportRepository from "@/repositories/reportRepository";

export async function requestReport() {
  const report = await reportRepository.createReport(null);

  await reportQueue.add(
    "generate-report",
    { reportId: report.id },
    { attempts: 2, backoff: { type: "exponential", delay: 2000 } }
  );

  return report;
}

export async function getReportStatus(id) {
  const report = await reportRepository.findReportById(id);
  if (!report) {
    const error = new Error("Report not found");
    error.statusCode = 404;
    throw error;
  }
  return report;
}