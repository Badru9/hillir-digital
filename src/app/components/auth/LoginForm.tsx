"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { TextField } from "@/app/components/ui/TextField";
import { SubmitButton } from "@/app/components/ui/SubmitButton";

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Email atau kata sandi salah");
      }

      router.replace(redirectTo?.startsWith("/") ? redirectTo : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Selamat datang kembali</h1>
        <p className="mt-1 text-sm text-slate-500">Masuk untuk melanjutkan ke dasbor Anda</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField
          id="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="nama@email.com"
          value={email}
          onChange={setEmail}
        />

        <TextField
          id="password"
          label="Kata sandi"
          type="password"
          required
          autoComplete="current-password"
          placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
          value={password}
          onChange={setPassword}
          hint={
            <span className="text-xs font-medium text-brand">Lupa kata sandi?</span>
          }
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <SubmitButton loading={loading} label="Masuk" loadingLabel="Memproses..." />
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <Link className="font-medium text-brand hover:underline" href="/register">
          Daftar
        </Link>
      </p>
    </div>
  );
}
