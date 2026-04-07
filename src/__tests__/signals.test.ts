// ─────────────────────────────────────────────────────────────
// feedeep — Signal Data Layer Tests
// Sahip Ol + Beğen/Beğenme localStorage katmanı.
// Standart bazlı: veri tutarlılığı, sınır durumları, toggle davranışı.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getSignal,
  toggleOwnership,
  toggleVote,
  getOwnedIds,
  getOwnedCount,
  getAllSignals,
  type Signal,
} from "@/lib/signals";

const STORAGE_KEY = "feedeep_signals";

beforeEach(() => {
  localStorage.clear();
});

// ─── getSignal — varsayılan sinyal ───

describe("getSignal()", () => {
  it("hiç veri yokken varsayılan sinyal döner", () => {
    const signal = getSignal("test-article-1");
    expect(signal.owned).toBe(false);
    expect(signal.vote).toBeNull();
  });

  it("farklı makaleler bağımsız sinyal döner", () => {
    toggleOwnership("article-a");
    const a = getSignal("article-a");
    const b = getSignal("article-b");
    expect(a.owned).toBe(true);
    expect(b.owned).toBe(false);
  });

  it("localStorage boş string ise varsayılan döner", () => {
    localStorage.setItem(STORAGE_KEY, "");
    const signal = getSignal("test");
    expect(signal.owned).toBe(false);
    expect(signal.vote).toBeNull();
  });

  it("localStorage bozuk JSON ise varsayılan döner", () => {
    localStorage.setItem(STORAGE_KEY, "{INVALID JSON}");
    const signal = getSignal("test");
    expect(signal.owned).toBe(false);
  });
});

// ─── toggleOwnership — sahiplenme toggle ───

describe("toggleOwnership()", () => {
  it("ilk tıklamada owned=true döner", () => {
    const result = toggleOwnership("article-1");
    expect(result.owned).toBe(true);
  });

  it("ikinci tıklamada owned=false döner (toggle)", () => {
    toggleOwnership("article-1");
    const result = toggleOwnership("article-1");
    expect(result.owned).toBe(false);
  });

  it("üçüncü tıklamada tekrar owned=true döner", () => {
    toggleOwnership("article-1");
    toggleOwnership("article-1");
    const result = toggleOwnership("article-1");
    expect(result.owned).toBe(true);
  });

  it("owned=true olduğunda ownedAt tarih içerir", () => {
    const result = toggleOwnership("article-1");
    expect(result.ownedAt).toBeDefined();
    // Geçerli ISO tarih olmalı
    expect(new Date(result.ownedAt!).toISOString()).toBe(result.ownedAt);
  });

  it("owned=false olduğunda ownedAt undefined olur", () => {
    toggleOwnership("article-1");
    const result = toggleOwnership("article-1");
    expect(result.ownedAt).toBeUndefined();
  });

  it("farklı makaleleri bağımsız sahiplenir", () => {
    toggleOwnership("article-a");
    toggleOwnership("article-b");
    expect(getSignal("article-a").owned).toBe(true);
    expect(getSignal("article-b").owned).toBe(true);
    expect(getSignal("article-c").owned).toBe(false);
  });

  it("localStorage'a kalıcı yazar", () => {
    toggleOwnership("article-1");
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed["article-1"].owned).toBe(true);
  });
});

// ─── toggleVote — oy mekanizması ───

describe("toggleVote()", () => {
  it("upvote ilk tıklamada vote='upvote' döner", () => {
    const result = toggleVote("article-1", "upvote");
    expect(result.vote).toBe("upvote");
  });

  it("aynı oy tipine tekrar tıklayınca null döner (kaldırma)", () => {
    toggleVote("article-1", "upvote");
    const result = toggleVote("article-1", "upvote");
    expect(result.vote).toBeNull();
  });

  it("upvote sonrası downvote geçiş yapar", () => {
    toggleVote("article-1", "upvote");
    const result = toggleVote("article-1", "downvote");
    expect(result.vote).toBe("downvote");
  });

  it("downvote sonrası upvote geçiş yapar", () => {
    toggleVote("article-1", "downvote");
    const result = toggleVote("article-1", "upvote");
    expect(result.vote).toBe("upvote");
  });

  it("oy varken votedAt tarih içerir", () => {
    const result = toggleVote("article-1", "upvote");
    expect(result.votedAt).toBeDefined();
    expect(new Date(result.votedAt!).toISOString()).toBe(result.votedAt);
  });

  it("oy kaldırıldığında votedAt undefined olur", () => {
    toggleVote("article-1", "upvote");
    const result = toggleVote("article-1", "upvote");
    expect(result.votedAt).toBeUndefined();
  });

  it("oy ve sahiplenme birbirinden bağımsız", () => {
    toggleOwnership("article-1");
    toggleVote("article-1", "upvote");
    const signal = getSignal("article-1");
    expect(signal.owned).toBe(true);
    expect(signal.vote).toBe("upvote");
  });

  it("farklı makalelerin oyları bağımsız", () => {
    toggleVote("article-a", "upvote");
    toggleVote("article-b", "downvote");
    expect(getSignal("article-a").vote).toBe("upvote");
    expect(getSignal("article-b").vote).toBe("downvote");
  });
});

// ─── getOwnedIds — sahiplenilen makaleler ───

describe("getOwnedIds()", () => {
  it("hiç sahiplenme yokken boş dizi döner", () => {
    expect(getOwnedIds()).toEqual([]);
  });

  it("sahiplenilen makale ID'lerini döner", () => {
    toggleOwnership("article-1");
    toggleOwnership("article-2");
    const ids = getOwnedIds();
    expect(ids).toContain("article-1");
    expect(ids).toContain("article-2");
    expect(ids.length).toBe(2);
  });

  it("sahiplenme geri alınırsa listeden düşer", () => {
    toggleOwnership("article-1");
    toggleOwnership("article-2");
    toggleOwnership("article-1"); // geri al
    const ids = getOwnedIds();
    expect(ids).not.toContain("article-1");
    expect(ids).toContain("article-2");
  });

  it("en yeni sahiplenme önce gelir (sıralama)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T10:00:00Z"));
    toggleOwnership("article-old");
    vi.setSystemTime(new Date("2025-01-01T10:01:00Z"));
    toggleOwnership("article-new");
    vi.useRealTimers();
    const ids = getOwnedIds();
    expect(ids[0]).toBe("article-new");
  });
});

// ─── getOwnedCount ───

describe("getOwnedCount()", () => {
  it("başlangıçta 0", () => {
    expect(getOwnedCount()).toBe(0);
  });

  it("sahiplenme sayısını doğru döner", () => {
    toggleOwnership("a");
    toggleOwnership("b");
    toggleOwnership("c");
    expect(getOwnedCount()).toBe(3);
  });

  it("geri alınan sahiplenmeleri saymaz", () => {
    toggleOwnership("a");
    toggleOwnership("b");
    toggleOwnership("a"); // geri al
    expect(getOwnedCount()).toBe(1);
  });
});

// ─── getAllSignals ───

describe("getAllSignals()", () => {
  it("boş store döner başlangıçta", () => {
    expect(getAllSignals()).toEqual({});
  });

  it("tüm sinyalleri döner", () => {
    toggleOwnership("article-1");
    toggleVote("article-2", "downvote");
    const all = getAllSignals();
    expect(Object.keys(all).length).toBe(2);
    expect(all["article-1"].owned).toBe(true);
    expect(all["article-2"].vote).toBe("downvote");
  });
});

// ─── Sınır durumları ───

describe("Sınır durumları", () => {
  it("boş article ID ile çalışır", () => {
    const signal = getSignal("");
    expect(signal.owned).toBe(false);
  });

  it("özel karakterli article ID ile çalışır", () => {
    toggleOwnership("haber-türkçe-başlık");
    expect(getSignal("haber-türkçe-başlık").owned).toBe(true);
  });

  it("çok uzun article ID ile çalışır", () => {
    const longId = "a".repeat(500);
    toggleOwnership(longId);
    expect(getSignal(longId).owned).toBe(true);
  });

  it("sinyal tipi doğru TypeScript tipinde", () => {
    const signal: Signal = getSignal("test");
    expect(typeof signal.owned).toBe("boolean");
    expect(signal.vote === null || signal.vote === "upvote" || signal.vote === "downvote").toBe(true);
  });
});
