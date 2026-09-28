import { SignJWT, jwtVerify } from "jose";

import { SESSION_MAX_AGE_SECONDS } from "./constants";

export interface SessionPayload {
  userId: number;
  email: string;
  username: string;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;

  return new SignJWT({ email: payload.email, username: payload.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.userId))
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || typeof payload.email !== "string") {
      return null;
    }

    return {
      userId,
      email: payload.email,
      username: typeof payload.username === "string" ? payload.username : "",
    };
  } catch {
    return null;
  }
}
