import { getReportStatus } from "@/services/reportService";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const report = await getReportStatus(id);

    const response = { success: true, data: report };
    if (report.status === "completed") {
      response.downloadUrl = `/api/reports/${id}/download`;
    }

    return Response.json(response);
  } catch (error) {
    const status = error.statusCode || 500;
    return Response.json({ success: false, error: error.message }, { status });
  }
}