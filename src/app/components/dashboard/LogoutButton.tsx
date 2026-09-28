"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
      isPending={loading}
      size="sm"
      variant="secondary"
      onPress={handleLogout}
    >
      {({ isPending }) => (isPending ? "Keluar..." : "Keluar")}
    </Button>
  );
}