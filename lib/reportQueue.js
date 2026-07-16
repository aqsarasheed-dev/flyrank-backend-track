import { Queue } from "bullmq";

const connection = { url: process.env.REDIS_URL };

export const reportQueue = new Queue("report-jobs", { connection });