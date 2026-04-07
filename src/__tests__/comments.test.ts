// ─────────────────────────────────────────────────────────────
// feedeep — Comment Data Layer Tests
// Threaded yorum sistemi localStorage katmanı.
// Standart bazlı: CRUD, thread yapısı, oy, sınır durumları.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  addComment,
  getComments,
  getRootComments,
  getReplies,
  deleteComment,
  voteComment,
  getCommentCount,
} from "@/lib/comments";

const STORAGE_KEY = "feedeep_comments";
const SIGNAL_KEY = "feedeep_signals";

beforeEach(() => {
  localStorage.clear();
});

// ─── addComment — yorum ekleme ───

describe("addComment()", () => {
  it("root yorum oluşturur", () => {
    const comment = addComment("article-1", "Harika bir yazı!");
    expect(comment.id).toBeTruthy();
    expect(comment.text).toBe("Harika bir yazı!");
    expect(comment.parentId).toBeUndefined();
    expect(comment.vote).toBeNull();
    expect(comment.createdAt).toBeTruthy();
  });

  it("reply oluşturur (parentId ile)", () => {
    const root = addComment("article-1", "Ana yorum");
    const reply = addComment("article-1", "Yanıt", undefined, root.id);
    expect(reply.parentId).toBe(root.id);
  });

  it("görsel ile yorum oluşturur", () => {
    const comment = addComment("article-1", "Meme paylaşımı", "data:image/png;base64,ABC");
    expect(comment.image).toBe("data:image/png;base64,ABC");
  });

  it("text trim edilir", () => {
    const comment = addComment("article-1", "  boşluklu metin  ");
    expect(comment.text).toBe("boşluklu metin");
  });

  it("boş text + görsel olmadan hata fırlatır", () => {
    expect(() => addComment("article-1", "   ")).toThrow();
  });

  it("boş text + görsel ile çalışır", () => {
    const comment = addComment("article-1", "", "data:image/png;base64,XYZ");
    expect(comment.text).toBe("");
    expect(comment.image).toBeDefined();
  });

  it("otomatik sahiplenme tetikler", () => {
    addComment("article-1", "Test yorum");
    const raw = localStorage.getItem(SIGNAL_KEY);
    expect(raw).toBeTruthy();
    const signals = JSON.parse(raw!);
    expect(signals["article-1"]?.owned).toBe(true);
  });

  it("zaten sahiplenilmişse tekrar toggle etmez", () => {
    // Önce sahiplen
    const signalStore: Record<string, { owned: boolean; vote: null }> = {
      "article-1": { owned: true, vote: null },
    };
    localStorage.setItem(SIGNAL_KEY, JSON.stringify(signalStore));

    addComment("article-1", "Yorum");
    const signals = JSON.parse(localStorage.getItem(SIGNAL_KEY)!);
    // Hala sahipli — toggle ile false olmamış olmalı
    expect(signals["article-1"].owned).toBe(true);
  });

  it("her yorum benzersiz ID alır", () => {
    const c1 = addComment("article-1", "Yorum 1");
    const c2 = addComment("article-1", "Yorum 2");
    const c3 = addComment("article-1", "Yorum 3");
    const ids = new Set([c1.id, c2.id, c3.id]);
    expect(ids.size).toBe(3);
  });

  it("localStorage'a kalıcı yazar", () => {
    addComment("article-1", "Kalıcı yorum");
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const store = JSON.parse(raw!);
    expect(store["article-1"]).toHaveLength(1);
    expect(store["article-1"][0].text).toBe("Kalıcı yorum");
  });
});

// ─── getComments — tüm yorumları getir ───

describe("getComments()", () => {
  it("hiç yorum yokken boş dizi döner", () => {
    expect(getComments("nonexistent")).toEqual([]);
  });

  it("en yeni yorum önce gelir (sıralama)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T10:00:00Z"));
    addComment("article-1", "Eski");
    vi.setSystemTime(new Date("2025-01-01T10:01:00Z"));
    addComment("article-1", "Yeni");
    vi.useRealTimers();
    const comments = getComments("article-1");
    expect(comments[0].text).toBe("Yeni");
    expect(comments[1].text).toBe("Eski");
  });

  it("reply dahil tüm yorumları döner", () => {
    const root = addComment("article-1", "Ana");
    addComment("article-1", "Yanıt", undefined, root.id);
    expect(getComments("article-1").length).toBe(2);
  });
});

// ─── getRootComments — root yorumlar ───

describe("getRootComments()", () => {
  it("sadece root yorumları döner", () => {
    const root = addComment("article-1", "Root");
    addComment("article-1", "Reply", undefined, root.id);
    const roots = getRootComments("article-1");
    expect(roots.length).toBe(1);
    expect(roots[0].text).toBe("Root");
  });

  it("birden fazla root yorumu döner", () => {
    addComment("article-1", "Root 1");
    addComment("article-1", "Root 2");
    addComment("article-1", "Root 3");
    expect(getRootComments("article-1").length).toBe(3);
  });
});

// ─── getReplies — yanıtlar ───

describe("getReplies()", () => {
  it("doğru parent'ın yanıtlarını döner", () => {
    const root = addComment("article-1", "Ana");
    addComment("article-1", "Yanıt 1", undefined, root.id);
    addComment("article-1", "Yanıt 2", undefined, root.id);
    const replies = getReplies("article-1", root.id);
    expect(replies.length).toBe(2);
  });

  it("en eski yanıt önce gelir (konuşma sırası)", () => {
    const root = addComment("article-1", "Ana");
    addComment("article-1", "İlk yanıt", undefined, root.id);
    addComment("article-1", "Son yanıt", undefined, root.id);
    const replies = getReplies("article-1", root.id);
    expect(replies[0].text).toBe("İlk yanıt");
    expect(replies[1].text).toBe("Son yanıt");
  });

  it("yanıt yokken boş dizi döner", () => {
    const root = addComment("article-1", "Ana");
    expect(getReplies("article-1", root.id)).toEqual([]);
  });

  it("iç içe yanıtlar (nested threading)", () => {
    const root = addComment("article-1", "Seviye 0");
    const reply1 = addComment("article-1", "Seviye 1", undefined, root.id);
    addComment("article-1", "Seviye 2", undefined, reply1.id);
    const level1 = getReplies("article-1", root.id);
    expect(level1.length).toBe(1);
    const level2 = getReplies("article-1", reply1.id);
    expect(level2.length).toBe(1);
    expect(level2[0].text).toBe("Seviye 2");
  });
});

// ─── deleteComment — yorum silme ───

describe("deleteComment()", () => {
  it("yorumu siler", () => {
    const comment = addComment("article-1", "Silinecek");
    deleteComment("article-1", comment.id);
    expect(getComments("article-1").length).toBe(0);
  });

  it("yanıtları da cascade siler", () => {
    const root = addComment("article-1", "Ana");
    addComment("article-1", "Yanıt", undefined, root.id);
    deleteComment("article-1", root.id);
    expect(getComments("article-1").length).toBe(0);
  });

  it("olmayan yorum silmek hata vermez", () => {
    expect(() => deleteComment("article-1", "nonexistent")).not.toThrow();
  });

  it("başka makale yorumlarını etkilemez", () => {
    addComment("article-1", "A makale");
    const b = addComment("article-2", "B makale");
    deleteComment("article-2", b.id);
    expect(getComments("article-1").length).toBe(1);
  });

  it("tüm yorumlar silinirse store temizlenir", () => {
    const c = addComment("article-1", "Tek yorum");
    deleteComment("article-1", c.id);
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(raw["article-1"]).toBeUndefined();
  });
});

// ─── voteComment — yorum oylama ───

describe("voteComment()", () => {
  it("up oy verir", () => {
    const c = addComment("article-1", "Test");
    voteComment("article-1", c.id, "up");
    const comments = getComments("article-1");
    expect(comments[0].vote).toBe("up");
  });

  it("aynı oy tipine tekrar tıklamak kaldırır", () => {
    const c = addComment("article-1", "Test");
    voteComment("article-1", c.id, "up");
    voteComment("article-1", c.id, "up");
    const comments = getComments("article-1");
    expect(comments[0].vote).toBeNull();
  });

  it("up'tan down'a geçer", () => {
    const c = addComment("article-1", "Test");
    voteComment("article-1", c.id, "up");
    voteComment("article-1", c.id, "down");
    const comments = getComments("article-1");
    expect(comments[0].vote).toBe("down");
  });

  it("olmayan yorum için hata vermez", () => {
    expect(() => voteComment("article-1", "nonexistent", "up")).not.toThrow();
  });
});

// ─── getCommentCount ───

describe("getCommentCount()", () => {
  it("hiç yorum yokken 0 döner", () => {
    expect(getCommentCount("article-1")).toBe(0);
  });

  it("reply dahil toplam sayıyı döner", () => {
    const root = addComment("article-1", "Root");
    addComment("article-1", "Reply", undefined, root.id);
    expect(getCommentCount("article-1")).toBe(2);
  });

  it("farklı makaleler bağımsız sayılır", () => {
    addComment("article-1", "A");
    addComment("article-2", "B");
    addComment("article-2", "C");
    expect(getCommentCount("article-1")).toBe(1);
    expect(getCommentCount("article-2")).toBe(2);
  });
});

// ─── Sınır Durumları ───

describe("Sınır durumları", () => {
  it("1000 karakter metin kabul eder", () => {
    const longText = "A".repeat(1000);
    const c = addComment("article-1", longText);
    expect(c.text.length).toBe(1000);
  });

  it("Türkçe karakterler düzgün saklanır", () => {
    const c = addComment("article-1", "Şüphesiz çığır açan bir gelişme. Öğrenmek güzel.");
    expect(c.text).toBe("Şüphesiz çığır açan bir gelişme. Öğrenmek güzel.");
  });

  it("localStorage bozuk olunca boş döner", () => {
    localStorage.setItem(STORAGE_KEY, "NOT_VALID_JSON");
    expect(getComments("article-1")).toEqual([]);
  });

  it("emoji destekler", () => {
    const c = addComment("article-1", "Harika bir proje 🚀");
    expect(c.text).toContain("🚀");
  });

  it("çoklu hat metin destekler", () => {
    const c = addComment("article-1", "Satır 1\nSatır 2\nSatır 3");
    expect(c.text).toContain("\n");
  });
});
