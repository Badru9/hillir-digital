import type { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api/response";
import { getSession } from "@/lib/auth/session";
import { calculateRoi } from "@/lib/roi";
import { calculationSchema, firstIssueMessage } from "@/lib/validation";
import { db } from "@/prisma/db";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return fail("Tidak terautentikasi", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Body permintaan tidak valid", 400);
  }

  const parsed = calculationSchema.safeParse(body);
  if (!parsed.success) {
    return fail(firstIssueMessage(parsed.error), 422);
  }

  const input = parsed.data;
  const result = calculateRoi(input);

  const calculation = await db.orm.public.Calculation.create({
    userId: session.userId,
    productPrice: input.productPrice,
    averageOrderValue: input.averageOrderValue,
    adSpend: input.adSpend,
    costPerResult: input.costPerResult,
    resultCount: result.resultCount,
    revenue: result.revenue,
    profit: result.profit,
    roi: result.roi,
    revenuePerResult: result.revenuePerResult,
    marginPerResult: result.marginPerResult,
  });

  return ok(calculation, 201);
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return fail("Tidak terautentikasi", 401);
  }

  const calculations = await db.orm.public.Calculation
    .where({ userId: session.userId })
    .orderBy((row) => row.createdAt.desc())
    .all();

  return ok(calculations);
}
