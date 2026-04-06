// ─────────────────────────────────────────────────────────────
// AI Rehber — Utility Functions (DRY helpers)
// ─────────────────────────────────────────────────────────────

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FRESHNESS } from "./constants";

/** Tailwind class merger — prevents conflicts, keeps specificity clean */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Tarih formatlama — Türkçe locale */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/** Kısa tarih — "14 Şub 2026" */
export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/** Relatif tarih — dakika / saat / gün çözünürlüklü */
export function timeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Az önce";
  if (diffMin < 60) return `${diffMin} dk önce`;
  if (diffHours < 24) return `${diffHours} sa önce`;
  if (diffDays === 1) return "Dün";
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
  return `${Math.floor(diffDays / 365)} yıl önce`;
}

/** Güncellik rozeti hesapla */
export function getFreshness(lastChecked: string | Date) {
  const now = new Date();
  const checked = new Date(lastChecked);
  const diffDays = Math.floor(
    (now.getTime() - checked.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= FRESHNESS.fresh.maxDays) return FRESHNESS.fresh;
  if (diffDays <= FRESHNESS.stale.maxDays) return FRESHNESS.stale;
  return FRESHNESS.outdated;
}

/** Okuma süresi hesapla — Türkçe ortalaması dakika başına ~200 kelime */
export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} dk okuma`;
}

/** Slug oluştur — Türkçe karakter desteği */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** URL'den domain çıkar */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

/** Metin kısalt (excerpt için) */
export function truncate(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

/** Kelime sayısı */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
