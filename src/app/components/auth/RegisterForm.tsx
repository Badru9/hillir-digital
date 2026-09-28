"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SubmitButton } from "@/app/components/ui/SubmitButton";
import { TextField } from "@/app/components/ui/TextField";

export default function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Gagal membuat akun");
      }

      // Registration signs the user in, so land straight on the dashboard.
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Buat akun baru</h1>
        <p className="mt-1 text-sm text-slate-500">
          Mulai prediksi ROI kampanye iklan Anda
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField
          id="username"
          label="Username"
          type="text"
          required
          autoComplete="username"
          placeholder="nama_pengguna"
          value={username}
          onChange={setUsername}
        />

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
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          value={password}
          onChange={setPassword}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <SubmitButton loading={loading} label="Daftar" loadingLabel="Memproses..." />
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <Link className="font-medium text-brand hover:underline" href="/login">
          Masuk
        </Link>
      </p>
    </div>
  );
}
