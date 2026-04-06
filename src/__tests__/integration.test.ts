// ─────────────────────────────────────────────────────────────
// AI Rehber — Cross-module Integration Tests
// Modüller arası etkileşim: yorum → otomatik sahiplenme,
// sinyal + yorum birlikte çalışma, veri tutarlılığı.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from "vitest";
import { addComment, getComments, getCommentCount, deleteComment } from "@/lib/comments";
import { getSignal, toggleOwnership, getOwnedIds, getOwnedCount, toggleVote } from "@/lib/signals";

beforeEach(() => {
  localStorage.clear();
});

// ─── Yorum → Otomatik Sahiplenme ───

describe("Yorum → Otomatik sahiplenme", () => {
  it("ilk yorum sahiplenmeyi tetikler", () => {
    expect(getSignal("article-1").owned).toBe(false);
    addComment("article-1", "İlk yorum");
    expect(getSignal("article-1").owned).toBe(true);
  });

  it("birden fazla yorum sahiplenmeyi bozmaz", () => {
    addComment("article-1", "Yorum 1");
    addComment("article-1", "Yorum 2");
    // Hala sahipli (toggle ile false olmamış)
    expect(getSignal("article-1").owned).toBe(true);
  });

  it("zaten sahiplenilmiş makaleye yorum toggle etmez", () => {
    toggleOwnership("article-1"); // owned = true
    addComment("article-1", "Yorum");
    // toggle çağrılmamış, hala true
    expect(getSignal("article-1").owned).toBe(true);
  });

  it("farklı makalelere yorum farklı sahiplenme", () => {
    addComment("article-a", "A yorumu");
    addComment("article-b", "B yorumu");
    expect(getSignal("article-a").owned).toBe(true);
    expect(getSignal("article-b").owned).toBe(true);
    expect(getOwnedCount()).toBe(2);
  });
});

// ─── Birlikte çalışma ───

describe("Signal + Comment birlikte çalışma", () => {
  it("yorum silinse de sahiplenme kalır", () => {
    const c = addComment("article-1", "Geçici yorum");
    expect(getSignal("article-1").owned).toBe(true);
    deleteComment("article-1", c.id);
    expect(getCommentCount("article-1")).toBe(0);
    // Sahiplenme hala duruyor
    expect(getSignal("article-1").owned).toBe(true);
  });

  it("oy ve yorum birlikte çalışır", () => {
    addComment("article-1", "Harika yazı");
    toggleVote("article-1", "upvote");
    const signal = getSignal("article-1");
    expect(signal.owned).toBe(true);
    expect(signal.vote).toBe("upvote");
    expect(getCommentCount("article-1")).toBe(1);
  });

  it("sahiplenme geri alınsa da yorum kalır", () => {
    addComment("article-1", "Yorum");
    toggleOwnership("article-1"); // geri al (false)
    expect(getSignal("article-1").owned).toBe(false);
    expect(getCommentCount("article-1")).toBe(1);
  });

  it("sahiplenilen makaleler listesi yorum yazılan makaleleri içerir", () => {
    addComment("article-1", "Yorum A");
    addComment("article-2", "Yorum B");
    toggleOwnership("article-3"); // sadece sahiplenme, yorum yok
    const ids = getOwnedIds();
    expect(ids).toContain("article-1");
    expect(ids).toContain("article-2");
    expect(ids).toContain("article-3");
    expect(ids.length).toBe(3);
  });
});

// ─── Veri tutarlılığı ───

describe("Veri tutarlılığı", () => {
  it("birçok makale için bağımsız çalışır", () => {
    const articleIds = Array.from({ length: 20 }, (_, i) => `article-${i}`);

    // Her makaleye yorum + oy
    for (let i = 0; i < articleIds.length; i++) {
      const id = articleIds[i];
      addComment(id, `Yorum: ${id}`);
      toggleVote(id, i % 2 === 0 ? "upvote" : "downvote");
    }

    // Hepsi sahipli
    expect(getOwnedCount()).toBe(20);

    // Her birinin yorumu var
    for (const id of articleIds) {
      expect(getCommentCount(id)).toBe(1);
      expect(getSignal(id).owned).toBe(true);
    }
  });

  it("localStorage temizlenince her şey sıfırlanır", () => {
    addComment("article-1", "Yorum");
    toggleVote("article-1", "upvote");
    localStorage.clear();
    expect(getSignal("article-1").owned).toBe(false);
    expect(getSignal("article-1").vote).toBeNull();
    expect(getComments("article-1")).toEqual([]);
  });
});
