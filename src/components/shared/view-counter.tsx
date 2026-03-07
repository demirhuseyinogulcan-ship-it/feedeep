// AI Rehber — View Counter (Social Proof)
// İçerik sayfalarında görüntülenme sayısı gösterir.
// localStorage tabanlı: her benzersiz ziyaret +1 artırır.
// Başlangıç sayısı yayın tarihine göre hesaplanır.
"use client";

import { useState } from "react";

interface ViewCounterProps {
  slug: string;
  publishDate: string;
  type?: "yazi" | "haber" | "prompt";
}

function getBaseViews(publishDate: string): number {
  const pub = new Date(publishDate).getTime();
  const now = Date.now();
  const daysSince = Math.floor((now - pub) / (1000 * 60 * 60 * 24));

  // Günlük ortalama 12-38 arası rastgele (ama deterministik) artış
  // slug bazlı seed yerine tarih bazlı tutarlı rakam
  const dailyRate = 12 + (pub % 27);
  return Math.max(47, Math.floor(daysSince * dailyRate + (pub % 200)));
}

function formatCount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 10 ? `${Math.floor(k)}K` : `${k.toFixed(1)}K`;
  }
  return n.toLocaleString("tr-TR");
}

export function ViewCounter({ slug, publishDate, type = "yazi" }: ViewCounterProps) {
  const [views] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;

    const storageKey = `views:${type}:${slug}`;
    const visitedKey = `visited:${type}:${slug}`;

    const stored = localStorage.getItem(storageKey);
    let current = stored ? parseInt(stored, 10) : getBaseViews(publishDate);

    const visited = sessionStorage.getItem(visitedKey);
    if (!visited) {
      current += 1;
      sessionStorage.setItem(visitedKey, "1");
    }

    localStorage.setItem(storageKey, String(current));
    return current;
  });

  if (views === null) return null;

  return (
    <span className="text-[10px] font-mono tracking-wider text-gray-600">
      {formatCount(views)} görüntülenme
    </span>
  );
}
