import { or } from "@prisma/orm-postgres/orm-client";
import type { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api/response";
import { hashPassword } from "@/lib/auth/password";
import { attachSessionCookie } from "@/lib/auth/session";
import { firstIssueMessage, registerSchema } from "@/lib/validation";
import { db } from "@/prisma/db";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Body permintaan tidak valid", 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return fail(firstIssueMessage(parsed.error), 422);
  }

  const { username, email, password } = parsed.data;

  const duplicate = await db.orm.public.User
    .where((user) => or(user.email.eq(email), user.username.eq(username)))
    .first();
  if (duplicate) {
    return fail("Email atau username sudah terdaftar", 409);
  }

  const user = await db.orm.public.User.create({
    username,
    email,
    passwordHash: await hashPassword(password),
  });

  const session = { userId: user.id, email: user.email, username: user.username };
  return attachSessionCookie(ok(session, 201), session);
}
