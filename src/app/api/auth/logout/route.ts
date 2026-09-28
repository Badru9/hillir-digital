import { ok } from "@/lib/api/response";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  return clearSessionCookie(ok({ loggedOut: true }));
}
