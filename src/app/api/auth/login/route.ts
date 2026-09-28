import type { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api/response";
import { verifyPassword } from "@/lib/auth/password";
import { attachSessionCookie } from "@/lib/auth/session";
import { firstIssueMessage, loginSchema } from "@/lib/validation";
import { db } from "@/prisma/db";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Body permintaan tidak valid", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return fail(firstIssueMessage(parsed.error), 422);
  }

  const { email, password } = parsed.data;
  const user = await db.orm.public.User.where({ email }).first();

  // Same message for unknown email and wrong password so the response cannot be used to enumerate accounts.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return fail("Email atau kata sandi salah", 401);
  }

  const session = { userId: user.id, email: user.email, username: user.username };
  return attachSessionCookie(ok(session), session);
}
