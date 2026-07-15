import { submitJob } from "@/services/jobService";

export async function POST(request) {
  try {
    const body = await request.json();
    const idempotencyKey = request.headers.get("idempotency-key") || body.idempotencyKey;

    const job = await submitJob({ idempotencyKey, input: body.input });

    return Response.json(
      { success: true, jobId: job.id, status: job.status },
      { status: 202 }
    );
  } catch (error) {
    const status = error.statusCode || 500;
    return Response.json({ success: false, error: error.message }, { status });
  }
}