import type { ReactNode } from "react";

import Brand from "@/app/components/Brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-brand-accent/20 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/60">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          &copy; 2024 AdForecast Pro &mdash; All rights reserved.
        </p>
      </div>
    </main>
  );
}
