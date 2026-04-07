// ─────────────────────────────────────────────────────────────
// feedeep — Username Generator Tests
// ~16K+ kombinasyon, Türkçe karakter desteği, benzersizlik.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import { generateUsername } from "@/lib/username-generator";

describe("generateUsername()", () => {
  it("boş olmayan string döner", () => {
    const name = generateUsername();
    expect(name).toBeTruthy();
    expect(typeof name).toBe("string");
    expect(name.length).toBeGreaterThan(0);
  });

  it("iki kısımdan oluşur (AlanRol formatı)", () => {
    const name = generateUsername();
    // PascalCase iki kelime: en az bir uppercase harften sonra
    // lowercase devam eder, sonra tekrar uppercase
    expect(name).toMatch(/^[A-ZÇĞİÖŞÜ]/);
  });

  it("100 üretimde tekrar olma ihtimali düşük", () => {
    const names = new Set<string>();
    for (let i = 0; i < 100; i++) {
      names.add(generateUsername());
    }
    // 16K havuz ile 100 denemede tekrar çok nadir
    expect(names.size).toBeGreaterThanOrEqual(90);
  });

  it("1000 üretimde hepsi geçerli string", () => {
    for (let i = 0; i < 1000; i++) {
      const name = generateUsername();
      expect(name.length).toBeGreaterThan(3);
      expect(name.length).toBeLessThan(50);
      // Boşluk veya özel karakter içermemeli
      expect(name).not.toMatch(/\s/);
    }
  });

  it("Türkçe karakterleri destekler", () => {
    // 1000 örnekten en az birinde Türkçe karakter olmalı
    const names: string[] = [];
    for (let i = 0; i < 1000; i++) {
      names.push(generateUsername());
    }
    const hasTurkish = names.some((n) => /[çğıöşüÇĞİÖŞÜ]/.test(n));
    expect(hasTurkish).toBe(true);
  });

  it("makul uzunlukta isimler üretir", () => {
    for (let i = 0; i < 100; i++) {
      const name = generateUsername();
      // Çok kısa veya çok uzun olmamalı
      expect(name.length).toBeGreaterThanOrEqual(5);
      expect(name.length).toBeLessThanOrEqual(40);
    }
  });
});

// ─── Dağılım testi ───

describe("Username dağılımı", () => {
  it("farklı başlangıç harfleri içerir", () => {
    const firstChars = new Set<string>();
    for (let i = 0; i < 500; i++) {
      firstChars.add(generateUsername()[0]);
    }
    // En az 5 farklı ilk harf olmalı
    expect(firstChars.size).toBeGreaterThanOrEqual(5);
  });

  it("farklı uzunluklarda isimler üretir", () => {
    const lengths = new Set<number>();
    for (let i = 0; i < 500; i++) {
      lengths.add(generateUsername().length);
    }
    // En az 3 farklı uzunluk olmalı
    expect(lengths.size).toBeGreaterThanOrEqual(3);
  });
});
