import { NextResponse } from "next/server";

/** Consistent JSON envelope: `{ success: true, data }` / `{ success: false, error }`. */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(error: string, status = 400, details?: unknown): NextResponse {
  return NextResponse.json(
    details === undefined ? { success: false, error } : { success: false, error, details },
    { status },
  );
}
