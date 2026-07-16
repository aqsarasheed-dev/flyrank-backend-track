import { requestReport } from "@/services/reportService";

export async function POST() {
  try {
    const report = await requestReport();
    return Response.json(
      { success: true, reportId: report.id, status: report.status },
      { status: 202 }
    );
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}