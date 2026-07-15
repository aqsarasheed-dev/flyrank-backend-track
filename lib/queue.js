import { Queue } from "bullmq";

const connection = { url: process.env.REDIS_URL };

export const aiJobQueue = new Queue("ai-jobs", { connection });