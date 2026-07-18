import { getUserFromRequest } from "@/lib/authMiddleware";
import { getMyWidget, updateMyWidget, deleteMyWidget } from "@/services/widgetService";

export async function GET(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const widget = await getMyWidget(id, user.userId);
    return Response.json({ success: true, data: widget });
  } catch (error) {
    const status = error.statusCode || 500;
    return Response.json({ success: false, error: error.message }, { status });
  }
}

export async function PUT(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const widget = await updateMyWidget(id, user.userId, body);
    return Response.json({ success: true, data: widget });
  } catch (error) {
    const status = error.statusCode || 500;
    return Response.json({ success: false, error: error.message }, { status });
  }
}

export async function DELETE(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await deleteMyWidget(id, user.userId);
    return Response.json({ success: true });
  } catch (error) {
    const status = error.statusCode || 500;
    return Response.json({ success: false, error: error.message }, { status });
  }
}