import { loginUser } from "@/services/authService";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await loginUser(body);
    return Response.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    const status = error.statusCode || 500;
    return Response.json({ success: false, error: error.message }, { status });
  }
}