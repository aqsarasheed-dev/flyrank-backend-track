import { getUserFromRequest } from "@/lib/authMiddleware";
import { getMyStats } from "@/services/dashboardService";

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await getMyStats(user.userId);
  return Response.json({ success: true, data: stats });
}