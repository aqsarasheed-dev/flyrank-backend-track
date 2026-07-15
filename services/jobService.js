import { aiJobQueue } from "@/lib/queue";
import * as jobRepository from "@/repositories/jobRepository";

export async function submitJob({ idempotencyKey, input }) {
  if (!idempotencyKey) {
    const error = new Error("idempotencyKey is required");
    error.statusCode = 400;
    throw error;
  }

  const job = await jobRepository.createJob({ idempotencyKey, input });

  // Only enqueue if this is a genuinely new job (status still 'queued' and never attempted)
  if (job.attempts === 0 && job.status === "queued") {
    await aiJobQueue.add(
      "process-ai-call",
      { jobId: job.id, input },
      {
        attempts: 3, // retry up to 3 times on failure
        backoff: { type: "exponential", delay: 2000 },
      }
    );
  }

  return job;
}

export async function getJobStatus(id) {
  const job = await jobRepository.findJobById(id);
  if (!job) {
    const error = new Error("Job not found");
    error.statusCode = 404;
    throw error;
  }
  return job;
}