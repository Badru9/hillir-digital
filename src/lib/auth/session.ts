import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "./constants";
import { signSession, verifySession, type SessionPayload } from "./jwt";

const isProduction = process.env.NODE_ENV === "production";

/** Reads and verifies the session cookie. Safe in Server Components and Route Handlers. */
export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySession(token) : null;
}

/** For protected Server Components: redirects to /login when there is no valid session. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function attachSessionCookie(
  response: NextResponse,
  session: SessionPayload,
): Promise<NextResponse> {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: await signSession(session),
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
