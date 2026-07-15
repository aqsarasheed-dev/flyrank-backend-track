import { verifyToken } from "@/services/authService";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return Response.json(
      { success: false, error: "No token provided" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return Response.json(
      { success: false, error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  return Response.json({
    success: true,
    message: `Hello ${payload.email}, you are authenticated!`,
    data: { userId: payload.userId, email: payload.email },
  });
}