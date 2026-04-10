"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — Auth Modal
// "Tek Hayat Hesap" — kayıt ve giriş tek modal.
// Context-driven: useAuth().requestAuth() ile herhangi yerden açılır.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { claimAccount, signIn } from "@/lib/auth";
import { generateUsername } from "@/lib/username-generator";
import { useAuth } from "./auth-provider";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Mode = "register" | "login";

export function AuthModal() {
  const { user, loading, showAuth, closeAuth } = useAuth();
  const [mode, setMode] = useState<Mode>("register");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [generatedName, setGeneratedName] = useState(() => generateUsername());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal açıldığında formu sıfırla (render-time state adjustment)
  const [prevShowAuth, setPrevShowAuth] = useState(false);
  if (showAuth && !prevShowAuth) {
    setPrevShowAuth(true);
    setUsername("");
    setPassword("");
    setError(null);
    setGeneratedName(generateUsername());
  }
  if (!showAuth && prevShowAuth) {
    setPrevShowAuth(false);
  }

  const regenerateName = useCallback(() => {
    setGeneratedName(generateUsername());
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    setSubmitting(true);
    setError(null);

    // Collision'da otomatik olarak 3 kez yeni isim üretip dene
    let attemptName = generatedName;
    let lastError: string | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error: err } = await claimAccount(password, attemptName);
      if (!err) {
        setSubmitting(false);
        return; // Başarılıysa onAuthChange → closeAuth otomatik tetiklenir
      }
      lastError = err;
      if (err === "Bu kullanıcı adı zaten alınmış." && attempt < 2) {
        attemptName = generateUsername();
        setGeneratedName(attemptName);
      } else {
        break;
      }
    }

    setSubmitting(false);
    if (lastError === "Bu kullanıcı adı zaten alınmış.") {
      setError("Bu isim de alındı. Değiştir'e basıp tekrar dene.");
    } else {
      setError(lastError);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Kullanıcı adı ve şifre gerekli.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const { error: err } = await signIn(username.trim(), password);
    setSubmitting(false);

    if (err) {
      setError(err);
    }
    // Başarılıysa onAuthChange → closeAuth otomatik tetiklenir
  }

  if (loading) return null;

  return (
    <>
      {/* Header butonları */}
      {user && !user.isAnonymous ? (
        <Link
          href="/profil"
          className="btn-liquid group relative px-4 py-1.5 text-xs font-heading font-medium text-white transition-transform hover:-translate-y-px"
        >
          <span className="btn-liquid-glow" />
          <span className="relative z-10 truncate max-w-[140px]">{user.username}</span>
        </Link>
      ) : null}

      {/* ── Full-screen Modal — portal to body ── */}
      {showAuth && (!user || user.isAnonymous) && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAuth();
          }}
        >
          {mode === "register" ? (
            <form
              onSubmit={handleRegister}
              className="w-full max-w-sm rounded-xl border border-white/[0.08] bg-[#0a0a0a] p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-2">
                <h2 className="text-lg font-heading font-bold text-gray-100">
                  Hesabını Kalıcı Yap
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Şu an anonim olarak geziniyorsun. Şifre belirleyerek verilerini kalıcı hale getirebilirsin.
                </p>
              </div>

              {/* Otomatik kullanıcı adı */}
              <div className="space-y-2">
                <label className="text-[11px] text-gray-500 block">
                  Kullanıcı adın
                </label>
                <div className="flex items-center gap-2">
                  <span className="flex-1 rounded-lg border border-white/[0.06] bg-surface-1 px-3 py-2 text-sm text-primary-400 font-semibold truncate">
                    {generatedName}
                  </span>
                  <button
                    type="button"
                    onClick={regenerateName}
                    className="text-xs text-gray-400 hover:text-gray-200 shrink-0 transition-colors px-2 py-1 rounded border border-white/[0.06] hover:border-white/[0.12]"
                  >
                    Değiştir
                  </button>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Bu isim sana özel atandı. Beğenmediysen Değiştir&apos;e bas.
                  Bu nicki sadece bir kere alabilirsin — iyi seç.
                </p>
              </div>

              {/* Şifre */}
              <div className="space-y-2">
                <label className="text-[11px] text-gray-500 block">
                  Şifre (en az 6 karakter)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifreni belirle..."
                  minLength={6}
                  autoFocus
                  className="w-full rounded-lg border border-white/[0.06] bg-surface-1 px-3 py-2 text-sm text-gray-300 placeholder:text-gray-600 focus:border-primary-500/30 focus:outline-none transition-colors"
                />
              </div>

              {/* ── Tek Hayat Uyarısı ── */}
              <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/[0.06] px-3 py-2.5 space-y-1">
                <p className="text-[10px] font-semibold text-yellow-400 uppercase tracking-widest">
                  Dikkat — Şifreni Unutma
                </p>
                <p className="text-xs text-yellow-300/70 leading-relaxed">
                  Şifre sıfırlama seçeneği henüz yoktur. Şifreni unutursan
                  yeni bir anonim hesapla devam etmen gerekir.
                </p>
              </div>

              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting || password.length < 6}
                  className={cn(
                    "flex-1 text-[11px] font-heading font-semibold tracking-widest uppercase py-2.5 rounded-md border transition-colors",
                    "border-primary-500/40 text-primary-400 hover:bg-primary-500/10",
                    "disabled:opacity-30 disabled:cursor-not-allowed",
                  )}
                >
                  {submitting ? "Yükseltiliyor..." : "Hesabı Kalıcı Yap"}
                </button>
                <button
                  type="button"
                  onClick={closeAuth}
                  className="text-[11px] text-gray-600 hover:text-gray-300 transition-colors"
                >
                  İptal
                </button>
              </div>

              <p className="text-[10px] text-gray-700 text-center">
                Zaten hesabın var mı?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(null); }}
                  className="text-primary-400/60 hover:text-primary-400"
                >
                  Giriş yap
                </button>
              </p>
            </form>
          ) : (
            <form
              onSubmit={handleLogin}
              className="w-full max-w-sm rounded-xl border border-white/[0.08] bg-[#0a0a0a] p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <h2 className="text-lg font-heading font-bold text-gray-100">
                  Giriş Yap
                </h2>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-gray-500 block">
                  Kullanıcı adın
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="PromptBüyücüsü"
                  autoFocus
                  className="w-full rounded-lg border border-white/[0.06] bg-surface-1 px-3 py-2 text-sm text-gray-300 placeholder:text-gray-600 focus:border-primary-500/30 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-gray-500 block">
                  Şifre
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifreni gir..."
                  className="w-full rounded-lg border border-white/[0.06] bg-surface-1 px-3 py-2 text-sm text-gray-300 placeholder:text-gray-600 focus:border-primary-500/30 focus:outline-none transition-colors"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting || !username.trim() || !password}
                  className={cn(
                    "flex-1 text-[11px] font-heading font-semibold tracking-widest uppercase py-2.5 rounded-md border transition-colors",
                    "border-white/[0.08] text-gray-300 hover:text-gray-100 hover:border-primary-500/30",
                    "disabled:opacity-30 disabled:cursor-not-allowed",
                  )}
                >
                  {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
                </button>
                <button
                  type="button"
                  onClick={closeAuth}
                  className="text-[11px] text-gray-600 hover:text-gray-300 transition-colors"
                >
                  İptal
                </button>
              </div>

              <p className="text-[10px] text-gray-700 text-center">
                Hesabın yok mu?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(null); }}
                  className="text-primary-400/60 hover:text-primary-400"
                >
                  Hesap oluştur
                </button>
              </p>
            </form>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
