import { getUserFromRequest } from "@/lib/authMiddleware";
import { getMySubmissions } from "@/services/dashboardService";

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await getMySubmissions(user.userId);
  return Response.json({ success: true, data: submissions });
}