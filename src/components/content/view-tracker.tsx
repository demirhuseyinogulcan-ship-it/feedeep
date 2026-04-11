"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — ViewTracker
// Makale sayfasına mount olunca fire-and-forget view increment.
// sessionStorage ile aynı oturumda tekrar istek atılmaz.
// Görsel çıktısı yok — sadece logic.
// ─────────────────────────────────────────────────────────────

import { useEffect } from "react";

export function ViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    const key = `vd_${articleId}`;
    if (sessionStorage.getItem(key)) return;

    sessionStorage.setItem(key, "1");
    fetch(`/api/views/${articleId}`, { method: "POST" }).catch(() => {});
  }, [articleId]);

  return null;
}
