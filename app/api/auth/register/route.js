import { registerUser } from "@/services/authService";

export async function POST(request) {
  try {
    const body = await request.json();
    const user = await registerUser(body);
    return Response.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    const status = error.statusCode || 500;
    return Response.json({ success: false, error: error.message }, { status });
  }
}