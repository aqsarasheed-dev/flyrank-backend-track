import { Worker } from "bullmq";
import * as jobRepository from "./repositories/jobRepository.js";

const connection = { url: process.env.REDIS_URL };

async function simulateSlowAICall(input) {
  console.log("🤖 Simulating slow AI call...");
  await new Promise((resolve) => setTimeout(resolve, 5000)); // pretend it takes 5 seconds

  // Simulate occasional random failure to prove retries work
  if (Math.random() < 0.3) {
    throw new Error("Simulated AI provider timeout");
  }

  return { summary: `Processed input: ${JSON.stringify(input)}`, tokensUsed: 42 };
}

const worker = new Worker(
  "ai-jobs",
  async (job) => {
    const { jobId, input } = job.data;
    console.log(`⚙️  Worker processing job ${jobId}, attempt ${job.attemptsMade + 1}`);

    await jobRepository.updateJobStatus(jobId, {
      status: "processing",
      attempts: job.attemptsMade + 1,
    });

    try {
      const result = await simulateSlowAICall(input);
      await jobRepository.updateJobStatus(jobId, {
        status: "completed",
        result,
        attempts: job.attemptsMade + 1,
      });
      console.log(`✅ Job ${jobId} completed`);
      return result;
    } catch (error) {
      await jobRepository.updateJobStatus(jobId, {
        status: "failed",
        error: error.message,
        attempts: job.attemptsMade + 1,
      });
      console.error(`🚨 ALERT: Job ${jobId} failed — ${error.message}`);
      throw error;
    }
  },
  { connection }
);

worker.on("failed", (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    console.error(`🚨 ALERT: Job ${job.data.jobId} permanently failed after ${job.attemptsMade} attempts: ${err.message}`);
  }
});

console.log("👷 Worker started, listening for jobs...");
