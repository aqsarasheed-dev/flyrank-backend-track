import { Worker } from "bullmq";
import * as jobRepository from "./repositories/jobRepository.js";

const connection = { url: process.env.REDIS_URL };

// ============================================
// WORKER 1: AI Jobs (from BE-06)
// ============================================

async function simulateSlowAICall(input) {
  console.log("🤖 Simulating slow AI call...");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  if (Math.random() < 0.3) {
    throw new Error("Simulated AI provider timeout");
  }

  return { summary: `Processed input: ${JSON.stringify(input)}`, tokensUsed: 42 };
}

const jobWorker = new Worker(
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

jobWorker.on("failed", (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    console.error(`🚨 ALERT: Job ${job.data.jobId} permanently failed after ${job.attemptsMade} attempts: ${err.message}`);
  }
});

console.log("👷 Worker started, listening for jobs...");

// ============================================
// WORKER 2: Report Generation (BE-07 / PDF report)
// ============================================

const reportWorker = new Worker(
  "report-jobs",
  async (job) => {
    const { reportId } = job.data;
    console.log(`📄 Worker generating report ${reportId}...`);

    await reportRepository.updateReport(reportId, { status: "processing" });

    try {
      const stats = await reportRepository.getBookStats();
      const filePath = await generateReportPdf(reportId, stats);

      await reportRepository.updateReport(reportId, {
        status: "completed",
        filePath,
      });
      console.log(`✅ Report ${reportId} generated at ${filePath}`);
    } catch (error) {
      await reportRepository.updateReport(reportId, {
        status: "failed",
        error: error.message,
      });
      console.error(`🚨 ALERT: Report ${reportId} generation failed — ${error.message}`);
      throw error;
    }
  },
  { connection }
);

console.log("👷 Report worker started, listening for report jobs...");