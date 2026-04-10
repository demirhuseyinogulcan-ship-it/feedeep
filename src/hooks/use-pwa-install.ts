"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — usePwaInstall Hook
// Header'daki "İndir" butonu için PWA install yönetimi.
// Buton her zaman görünür (standalone hariç).
// beforeinstallprompt varsa native install, yoksa talimat gösterir.
// Module-level prompt store: PwaInstallBanner ile paylaşılır.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// ── Module-level store ──────────────────────────────────────
// Birden fazla component/hook aynı prompt'u paylaşır.
let sharedPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function setSharedPrompt(p: BeforeInstallPromptEvent | null) {
  sharedPrompt = p;
  listeners.forEach((fn) => fn());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    setSharedPrompt(e as BeforeInstallPromptEvent);
  });
}

// ── Hook ────────────────────────────────────────────────────

export function usePwaInstall() {
  const [prompt, setPrompt] = useState(sharedPrompt);
  const [showGuide, setShowGuide] = useState(false);

  // Standalone kontrolü — render zamanında hesaplanır, state'e gerek yok
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as unknown as { standalone: boolean }).standalone));

  useEffect(() => {
    // Shared prompt değişikliklerini dinle
    const sync = () => setPrompt(sharedPrompt);
    listeners.add(sync);
    return () => { listeners.delete(sync); };
  }, []);

  const install = useCallback(async () => {
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        setSharedPrompt(null);
      }
    } else {
      // Native prompt yok — kısa talimat göster
      setShowGuide(true);
    }
  }, [prompt]);

  const closeGuide = useCallback(() => setShowGuide(false), []);

  return {
    /** Buton gösterilmeli mi (standalone değilse true) */
    visible: !isStandalone,
    /** Native install prompt mevcut mu */
    canInstall: prompt !== null,
    install,
    /** Tarayıcı desteği yoksa talimat popup'ı */
    showGuide,
    closeGuide,
  };
}

/** PwaInstallBanner gibi dış component'ler için shared prompt'a erişim */
export function getSharedPrompt() {
  return sharedPrompt;
}

export function consumeSharedPrompt() {
  setSharedPrompt(null);
}
