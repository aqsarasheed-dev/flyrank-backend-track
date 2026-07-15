import { getJobStatus } from "@/services/jobService";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const job = await getJobStatus(id);
    return Response.json({ success: true, data: job });
  } catch (error) {
    const status = error.statusCode || 500;
    return Response.json({ success: false, error: error.message }, { status });
  }
}