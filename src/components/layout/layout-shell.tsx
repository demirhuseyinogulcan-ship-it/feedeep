// ─────────────────────────────────────────────────────────────
// feedeep — Layout Shell (Client Component)
// Sidebar state yonetimi + desktop/mobil layout gecisi.
// Tek sorumluluk: sidebar acik/kapali state'i ve content offset'i.
// Kaldirilmasi: bu dosyayi sil, layout.tsx'te children'i direkt render et.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useCallback, useSyncExternalStore, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "feedeep-sidebar";

function getSnapshot(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== "closed";
}

function getServerSnapshot(): boolean {
  return true;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

type Props = {
  children: ReactNode;
};

export function LayoutShell({ children }: Props) {
  const sidebarOpen = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleSidebar = useCallback(() => {
    const next = !sidebarOpen;
    localStorage.setItem(STORAGE_KEY, next ? "open" : "closed");
    // storage event'i ayni pencerede tetiklenmez, manual dispatch
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  }, [sidebarOpen]);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div
        className={cn(
          "transition-[margin-left] duration-300 ease-in-out",
          sidebarOpen ? "lg:ml-56" : "lg:ml-0",
        )}
      >
        {children}
      </div>
    </>
  );
}
