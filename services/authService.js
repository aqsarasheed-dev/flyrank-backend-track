import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as authRepository from "@/repositories/authRepository";

const JWT_SECRET = process.env.JWT_SECRET;

export async function registerUser({ email, password }) {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const existing = await authRepository.findUserByEmail(email);
  if (existing) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await authRepository.createUser({ email, passwordHash });
  return user;
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });

  return { token, user: { id: user.id, email: user.email } };
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}