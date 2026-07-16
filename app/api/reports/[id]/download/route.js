import fs from "fs";
import path from "path";
import { getReportStatus } from "@/services/reportService";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const report = await getReportStatus(id);

    if (report.status !== "completed" || !report.file_path) {
      return Response.json(
        { success: false, error: "Report not ready yet" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(report.file_path);
    const fileName = path.basename(report.file_path);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}