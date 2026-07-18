import * as submissionRepository from "@/repositories/submissionRepository";

export async function getMySubmissions(ownerId) {
  return submissionRepository.findSubmissionsByWidgetOwner(ownerId);
}

export async function getMyStats(ownerId) {
  return submissionRepository.getStatsForOwner(ownerId);
}