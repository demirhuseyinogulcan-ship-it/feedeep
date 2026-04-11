"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — Auth Modal
// "Tek Hayat Hesap" — kayıt ve giriş tek modal.
// Context-driven: useAuth().requestAuth() ile herhangi yerden açılır.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import { claimAccount, signIn } from "@/lib/auth";
import { generateUsername } from "@/lib/username-generator";
import { useAuth } from "./auth-provider";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Mode = "register" | "login";

// Her dilde feedeep kimliği — kayan tagline için
const TAGLINE_WORDS = [
  "yazılımın sesi",
  "voice of software",
  "stimme der software",
  "la voce del software",
  "软件之声",
  "ソフトウェアの声",
  "صوت البرمجيات",
  "голос ПО",
  "yazılımın sesi",
  "voice of software",
  "stimme der software",
  "la voce del software",
  "软件之声",
  "ソフトウェアの声",
  "صوت البرمجيات",
  "голос ПО",
];

export function AuthModal() {
  const { user, loading, showAuth, closeAuth } = useAuth();
  const [mode, setMode] = useState<Mode>("register");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [generatedName, setGeneratedName] = useState(() => generateUsername());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Modal açıldığında formu sıfırla (render-time state adjustment)
  const [prevShowAuth, setPrevShowAuth] = useState(false);
  if (showAuth && !prevShowAuth) {
    setPrevShowAuth(true);
    setUsername("");
    setPassword("");
    setError(null);
    setMode("register");
    setShowPassword(false);
    setGeneratedName(generateUsername());
  }
  if (!showAuth && prevShowAuth) {
    setPrevShowAuth(false);
  }

  const regenerateName = useCallback(() => {
    setGeneratedName(generateUsername());
  }, []);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setShowPassword(false);
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
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

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
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
      {/* Header — giriş yapmış kullanıcı profil butonu */}
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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAuth();
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0a0a0a] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >

            {/* ── Marka başlığı ── */}
            <div className="px-8 pt-8 pb-5 text-center border-b border-white/[0.06]">
              <span className="logo-gradient text-[26px] leading-none">feedeep</span>
              {/* Her dilde kayan tagline */}
              <div className="ticker-wrapper overflow-hidden mt-3">
                <div
                  className="ticker-track flex gap-6 text-xs text-gray-500 whitespace-nowrap"
                  style={{ animationDuration: "22s" }}
                >
                  {TAGLINE_WORDS.map((word, i) => (
                    <span key={i}>{word}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Mod sekmeleri ── */}
            <div className="flex border-b border-white/[0.06]">
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={cn(
                  "flex-1 py-3 text-[11px] font-heading font-semibold tracking-widest uppercase transition-colors",
                  mode === "register"
                    ? "text-primary-400 border-b-2 border-primary-500 -mb-px"
                    : "text-gray-600 hover:text-gray-400",
                )}
              >
                Hesap Oluştur
              </button>
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={cn(
                  "flex-1 py-3 text-[11px] font-heading font-semibold tracking-widest uppercase transition-colors",
                  mode === "login"
                    ? "text-primary-400 border-b-2 border-primary-500 -mb-px"
                    : "text-gray-600 hover:text-gray-400",
                )}
              >
                Giriş Yap
              </button>
            </div>

            {/* ── Form içeriği ── */}
            <div className="px-8 py-7">
              {mode === "register" ? (
                <form onSubmit={handleRegister} className="space-y-5">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Anonim kimliğini kalıcı yap. Sinyallerin ve koleksiyonun seninle kalır.
                  </p>

                  {/* Otomatik kullanıcı adı */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 block">
                      Kullanıcı adın
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="flex-1 rounded-lg border border-primary-500/20 bg-primary-500/[0.04] px-3 py-2.5 text-sm text-primary-400 font-semibold truncate">
                        {generatedName}
                      </span>
                      <button
                        type="button"
                        onClick={regenerateName}
                        className="text-xs text-gray-500 hover:text-gray-200 shrink-0 transition-colors px-3 py-2.5 rounded-lg border border-white/[0.06] hover:border-white/[0.12]"
                      >
                        Değiştir
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Nick sana özel üretildi. Sonradan değiştiremezsin — iyi seç.
                    </p>
                  </div>

                  {/* Şifre */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 block">
                      Şifre
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="En az 6 karakter"
                        minLength={6}
                        autoFocus
                        autoComplete="new-password"
                        className="w-full rounded-lg border border-white/[0.06] bg-surface-1 px-3 py-2.5 pr-16 text-sm text-gray-300 placeholder:text-gray-600 focus:border-primary-500/30 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Şifre uyarısı — sarı değil, void kimliğine uygun */}
                  <p className="text-[11px] text-gray-600 leading-relaxed border-l-2 border-primary-500/25 pl-3">
                    Şifreni güvenli bir yere kaydet. Sıfırlama henüz aktif değil.
                  </p>

                  {error && (
                    <p className="text-xs text-red-400">{error}</p>
                  )}

                  <div className="space-y-3 pt-1">
                    <button
                      type="submit"
                      disabled={submitting || password.length < 6}
                      className={cn(
                        "btn-liquid relative w-full py-3 text-[11px] font-heading font-semibold tracking-widest uppercase text-white",
                        "transition-transform hover:-translate-y-px",
                        "disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none",
                      )}
                    >
                      <span className="btn-liquid-glow" />
                      <span className="relative z-10">
                        {submitting ? "Yükseltiliyor..." : "Topluluğa Katıl"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={closeAuth}
                      className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors py-1"
                    >
                      Şimdilik geç
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-5">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Daha önce hesap oluşturduysan buradan giriş yap.
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 block">
                      Kullanıcı adın
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="PromptBüyücüsü"
                      autoFocus
                      className="w-full rounded-lg border border-white/[0.06] bg-surface-1 px-3 py-2.5 text-sm text-gray-300 placeholder:text-gray-600 focus:border-primary-500/30 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 block">
                      Şifre
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Şifreni gir"
                        autoComplete="current-password"
                        className="w-full rounded-lg border border-white/[0.06] bg-surface-1 px-3 py-2.5 pr-16 text-sm text-gray-300 placeholder:text-gray-600 focus:border-primary-500/30 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-400">{error}</p>
                  )}

                  <div className="space-y-3 pt-1">
                    <button
                      type="submit"
                      disabled={submitting || !username.trim() || !password}
                      className={cn(
                        "w-full py-3 text-[11px] font-heading font-semibold tracking-widest uppercase rounded-lg",
                        "bg-primary-600 text-white hover:bg-primary-500 transition-colors",
                        "disabled:opacity-40 disabled:cursor-not-allowed",
                      )}
                    >
                      {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </button>
                    <button
                      type="button"
                      onClick={closeAuth}
                      className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors py-1"
                    >
                      Vazgeç
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
