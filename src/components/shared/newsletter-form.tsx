// ─────────────────────────────────────────────────────────────
// AI Rehber — Newsletter Form (Client Component)
// E-posta abonelik formu — API route ile çalışır
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, type FormEvent } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error);
      }
    } catch {
      setStatus("error");
      setMessage("Bağlantı hatası. Lütfen tekrar deneyin.");
    }
  };

  if (status === "success") {
    return <p className="text-sm text-gray-400 mt-6">{message}</p>;
  }

  return (
    <div className="mt-6">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresiniz"
          className="flex-1 px-4 py-2.5 rounded-lg bg-surface-2 border border-white/[0.04] text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all"
          required
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-5 py-2.5 bg-white text-surface-0 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors whitespace-nowrap disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Abone Ol"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-xs text-gray-500 mt-2">{message}</p>
      )}
    </div>
  );
}
