"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Couldn't sign in.");
        return;
      }
      router.push("/");
      // The layout's auth check runs on the server, so the cached tree has to
      // be dropped or it renders the redirect again.
      router.refresh();
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-5 py-20">
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-rec" />
          <h1 className="font-serif text-xl tracking-tight">Lecture Notes</h1>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Enter the password to reach your lectures.
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-lg border border-hairline bg-panel px-3 py-3 text-base outline-none transition-colors placeholder:text-faint focus:border-faint"
        />
        <button
          type="submit"
          disabled={busy || password === ""}
          className="rounded-lg bg-chalk py-3 text-sm font-semibold text-ink transition-transform active:scale-[0.99] disabled:opacity-40"
        >
          {busy ? "Checking…" : "Continue"}
        </button>
      </form>

      {error && (
        <p className="rounded-lg border border-rec/40 bg-rec/10 px-3 py-2 text-sm text-rec">
          {error}
        </p>
      )}

      <p className="text-xs leading-relaxed text-faint">
        Recordings are stored in this browser, not on the server. Signing in on
        a different device shows you a different, empty library.
      </p>
    </main>
  );
}
