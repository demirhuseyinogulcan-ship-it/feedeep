// ─────────────────────────────────────────────────────────────
// AI Rehber — Utils Unit Tests
// ─────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  cn,
  formatDate,
  formatDateShort,
  timeAgo,
  slugify,
  extractDomain,
  truncate,
  wordCount,
  calculateReadingTime,
} from "@/lib/utils";

// ─── cn() — Tailwind class merger ───

describe("cn()", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conflicting classes via tailwind-merge", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
  });

  it("filters falsy values", () => {
    expect(cn("base", false, null, undefined, "extra")).toBe("base extra");
  });

  it("returns empty string for no input", () => {
    expect(cn()).toBe("");
  });
});

// ─── formatDate() — Turkish locale ───

describe("formatDate()", () => {
  it("formats string date to Turkish locale", () => {
    const result = formatDate("2026-03-05");
    expect(result).toMatch(/5 Mart 2026/);
  });

  it("formats Date object", () => {
    const result = formatDate(new Date("2026-01-15"));
    expect(result).toMatch(/15 Ocak 2026/);
  });

  it("handles edge case: year boundary", () => {
    const result = formatDate("2025-12-31");
    expect(result).toMatch(/31 Aralık 2025/);
  });
});

// ─── formatDateShort() ───

describe("formatDateShort()", () => {
  it("returns short Turkish date format", () => {
    const result = formatDateShort("2026-03-05");
    expect(result).toMatch(/5 Mar 2026/);
  });
});

// ─── timeAgo() — Relative time ───

describe("timeAgo()", () => {
  it('returns "Bugün" for today', () => {
    const today = new Date().toISOString();
    expect(timeAgo(today)).toBe("Bugün");
  });

  it('returns "Dün" for yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(timeAgo(yesterday)).toBe("Dün");
  });

  it('returns "X gün önce" for 2-6 days', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(timeAgo(threeDaysAgo)).toBe("3 gün önce");
  });

  it('returns "X hafta önce" for 7-29 days', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
    expect(timeAgo(twoWeeksAgo)).toBe("2 hafta önce");
  });

  it('returns "X ay önce" for 30-364 days', () => {
    const twoMonthsAgo = new Date(Date.now() - 60 * 86400000).toISOString();
    expect(timeAgo(twoMonthsAgo)).toBe("2 ay önce");
  });

  it('returns "X yıl önce" for 365+ days', () => {
    const twoYearsAgo = new Date(Date.now() - 730 * 86400000).toISOString();
    expect(timeAgo(twoYearsAgo)).toBe("2 yıl önce");
  });
});

// ─── slugify() — Turkish character support ───

describe("slugify()", () => {
  it("converts Turkish characters", () => {
    expect(slugify("Türkçe Başlık")).toBe("turkce-baslik");
  });

  it("handles all Turkish special characters", () => {
    expect(slugify("ğüşıöç")).toBe("gusioç".replace("ç", "c"));
    expect(slugify("ğüşıöç")).toBe("gusioc");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! World? @2026")).toBe("hello-world-2026");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("ai---rehber")).toBe("ai-rehber");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("-ai rehber-")).toBe("ai-rehber");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("converts spaces to hyphens", () => {
    expect(slugify("yapay zeka haberleri")).toBe("yapay-zeka-haberleri");
  });
});

// ─── extractDomain() ───

describe("extractDomain()", () => {
  it("extracts domain from URL", () => {
    expect(extractDomain("https://www.example.com/path")).toBe("example.com");
  });

  it("removes www prefix", () => {
    expect(extractDomain("https://www.airehber.com")).toBe("airehber.com");
  });

  it("handles URL without www", () => {
    expect(extractDomain("https://techcrunch.com")).toBe("techcrunch.com");
  });

  it("returns input for invalid URL", () => {
    expect(extractDomain("not a url")).toBe("not a url");
  });
});

// ─── truncate() ───

describe("truncate()", () => {
  it("returns text as-is if shorter than max", () => {
    expect(truncate("kısa metin", 160)).toBe("kısa metin");
  });

  it("truncates at word boundary", () => {
    const longText = "Bu çok uzun bir metin parçası ve kesilmesi gerekiyor";
    const result = truncate(longText, 20);
    expect(result.length).toBeLessThanOrEqual(25); // +5 for ellipsis and word boundary
    expect(result).toContain("…");
  });

  it("uses default maxLength of 160", () => {
    const text = "a".repeat(200);
    const result = truncate(text);
    expect(result.length).toBeLessThanOrEqual(165);
  });
});

// ─── wordCount() ───

describe("wordCount()", () => {
  it("counts words correctly", () => {
    expect(wordCount("yapay zeka haberleri")).toBe(3);
  });

  it("handles extra whitespace", () => {
    expect(wordCount("  çok   boşluklu   metin  ")).toBe(3);
  });

  it("returns 0 for empty/whitespace", () => {
    expect(wordCount("   ")).toBe(0);
  });
});

// ─── calculateReadingTime() ───

describe("calculateReadingTime()", () => {
  it("returns 1 dk for short text", () => {
    const shortText = "kelime ".repeat(50);
    expect(calculateReadingTime(shortText)).toBe("1 dk okuma");
  });

  it("returns correct time for longer text", () => {
    const mediumText = "kelime ".repeat(400);
    expect(calculateReadingTime(mediumText)).toBe("2 dk okuma");
  });

  it("rounds up", () => {
    const text = "kelime ".repeat(250);
    expect(calculateReadingTime(text)).toBe("2 dk okuma");
  });
});
