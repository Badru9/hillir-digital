import type { ReactNode } from "react";

import DashboardNav from "@/app/components/dashboard/DashboardNav";
import { requireSession } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();

  return (
    <div className="min-h-screen">
      <DashboardNav username={session.username} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
