import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: number;
  email: string;
}

const secret = process.env.JWT_SECRET ?? "change-me-in-production";

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch {
    return null;
  }
}
