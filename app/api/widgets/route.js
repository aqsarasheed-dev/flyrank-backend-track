import { getUserFromRequest } from "@/lib/authMiddleware";
import { createWidget, listMyWidgets } from "@/services/widgetService";

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const widget = await createWidget(user.userId, body);
    return Response.json({ success: true, data: widget }, { status: 201 });
  } catch (error) {
    const status = error.statusCode || 500;
    return Response.json({ success: false, error: error.message }, { status });
  }
}

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const widgets = await listMyWidgets(user.userId);
  return Response.json({ success: true, data: widgets });
}