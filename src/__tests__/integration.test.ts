// ─────────────────────────────────────────────────────────────
// feedeep — Cross-module Integration Tests
// Modüller arası etkileşim: yorum → otomatik sahiplenme,
// sinyal + yorum birlikte çalışma, veri tutarlılığı.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, vi } from "vitest";
import { addComment, getComments, getCommentCount, deleteComment } from "@/lib/comments";
import { getSignal, toggleOwnership, getOwnedIds, getOwnedCount, toggleVote } from "@/lib/signals";

vi.mock("@/lib/sanitize", () => ({
  sanitizeText: vi.fn(async (text: string) => text),
}));

beforeEach(() => {
  localStorage.clear();
});

// ─── Yorum → Manuel Sahiplenme (hook katmanında otomatik tetikler) ───

describe("Yorum → Otomatik sahiplenme", () => {
  it("yorum sonrası manuel sahiplenme çalışır", async () => {
    await addComment("article-1", "İlk yorum");
    // Otomatik sahiplenme artık hook katmanında; data layer dokunmaz
    expect(getSignal("article-1").owned).toBe(false);
    toggleOwnership("article-1");
    expect(getSignal("article-1").owned).toBe(true);
  });

  it("zaten sahiplenilmiş makaleye yorum toggle etmez", async () => {
    toggleOwnership("article-1"); // owned = true
    await addComment("article-1", "Yorum");
    // Data layer sahiplenmeye dokunmaz
    expect(getSignal("article-1").owned).toBe(true);
  });

  it("farklı makalelere yorum bağımsız (sinyal ayrı)", async () => {
    await addComment("article-a", "A yorumu");
    await addComment("article-b", "B yorumu");
    // Data layer sinyal store'a yazmaz
    expect(getSignal("article-a").owned).toBe(false);
    expect(getSignal("article-b").owned).toBe(false);
  });
});

// ─── Birlikte çalışma ───

describe("Signal + Comment birlikte çalışma", () => {
  it("yorum silinse de sahiplenme kalır", async () => {
    toggleOwnership("article-1"); // hook katmanını simüle et
    const c = await addComment("article-1", "Geçici yorum");
    expect(getSignal("article-1").owned).toBe(true);
    deleteComment("article-1", c.id);
    expect(getCommentCount("article-1")).toBe(0);
    // Sahiplenme hala duruyor
    expect(getSignal("article-1").owned).toBe(true);
  });

  it("oy ve yorum birlikte çalışır", async () => {
    toggleOwnership("article-1"); // hook katmanını simüle et
    await addComment("article-1", "Harika yazı");
    toggleVote("article-1", "upvote");
    const signal = getSignal("article-1");
    expect(signal.owned).toBe(true);
    expect(signal.vote).toBe("upvote");
    expect(getCommentCount("article-1")).toBe(1);
  });

  it("sahiplenme geri alınsa da yorum kalır", async () => {
    toggleOwnership("article-1");
    await addComment("article-1", "Yorum");
    toggleOwnership("article-1"); // geri al (false)
    expect(getSignal("article-1").owned).toBe(false);
    expect(getCommentCount("article-1")).toBe(1);
  });

  it("sahiplenilen makaleler listesi sadece sinyal store'dan gelir", async () => {
    await addComment("article-1", "Yorum A");
    await addComment("article-2", "Yorum B");
    toggleOwnership("article-3"); // sadece sahiplenme, yorum yok
    const ids = getOwnedIds();
    // Yorum yazmak sahiplenmez; sadece toggleOwnership yapan article-3 listede
    expect(ids).not.toContain("article-1");
    expect(ids).not.toContain("article-2");
    expect(ids).toContain("article-3");
    expect(ids.length).toBe(1);
  });
});

// ─── Veri tutarlılığı ───

describe("Veri tutarlılığı", () => {
  it("birçok makale için bağımsız çalışır", async () => {
    const articleIds = Array.from({ length: 20 }, (_, i) => `article-${i}`);

    // Her makaleye yorum + oy + sahiplenme (hook katmanını simüle et)
    for (let i = 0; i < articleIds.length; i++) {
      const id = articleIds[i];
      await addComment(id, `Yorum: ${id}`);
      toggleOwnership(id);
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

  it("localStorage temizlenince her şey sıfırlanır", async () => {
    await addComment("article-1", "Yorum");
    toggleVote("article-1", "upvote");
    localStorage.clear();
    expect(getSignal("article-1").owned).toBe(false);
    expect(getSignal("article-1").vote).toBeNull();
    expect(getComments("article-1")).toEqual([]);
  });
});
