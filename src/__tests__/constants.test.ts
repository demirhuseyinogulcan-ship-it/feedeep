// ─────────────────────────────────────────────────────────────
// feedeep — Constants Integrity Tests
// ─────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  SITE,
  NAV_ITEMS,
  FRESHNESS,
  YAZI_CATEGORIES,
  HABER_CATEGORIES,
} from "@/lib/constants";

// ─── SITE config ───

describe("SITE constants", () => {
  it("has required fields", () => {
    expect(SITE.name).toBeDefined();
    expect(SITE.url).toBeDefined();
    expect(SITE.locale).toBeDefined();
    expect(SITE.language).toBeDefined();
  });

  it("URL is valid HTTPS", () => {
    expect(SITE.url).toMatch(/^https:\/\//);
    expect(SITE.url).not.toMatch(/\/$/); // no trailing slash
  });

  it("locale format is correct", () => {
    expect(SITE.locale).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
  });

  it("language is Turkish", () => {
    expect(SITE.language).toBe("tr");
  });

  it("author has required info", () => {
    expect(SITE.author.name).toBeDefined();
    expect(SITE.author.email).toMatch(/@/);
    expect(SITE.author.role).toBeDefined();
  });

  it("organization has logo paths", () => {
    expect(SITE.organization.logo).toMatch(/^\//);
    expect(SITE.organization.logoSquare).toMatch(/^\//);
  });
});

// ─── NAV_ITEMS ───

describe("NAV_ITEMS", () => {
  it("has navigation items", () => {
    expect(NAV_ITEMS.length).toBeGreaterThan(0);
  });

  it("all items have label and href", () => {
    for (const item of NAV_ITEMS) {
      expect(item.label).toBeDefined();
      expect(item.href).toMatch(/^\//);
    }
  });

  it("no duplicate hrefs", () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});

// ─── FRESHNESS ───

describe("FRESHNESS badges", () => {
  it("has three tiers", () => {
    expect(FRESHNESS.fresh).toBeDefined();
    expect(FRESHNESS.stale).toBeDefined();
    expect(FRESHNESS.outdated).toBeDefined();
  });

  it("tiers are properly ordered", () => {
    expect(FRESHNESS.fresh.maxDays).toBeLessThan(FRESHNESS.stale.maxDays);
    expect(FRESHNESS.stale.maxDays).toBeLessThan(FRESHNESS.outdated.maxDays);
  });

  it("all tiers have labels", () => {
    expect(FRESHNESS.fresh.label).toBeDefined();
    expect(FRESHNESS.stale.label).toBeDefined();
    expect(FRESHNESS.outdated.label).toBeDefined();
  });
});

// ─── Category Maps ───

describe("Category maps", () => {
  it("YAZI_CATEGORIES has expected categories", () => {
    expect(YAZI_CATEGORIES).toHaveProperty("analiz");
    expect(YAZI_CATEGORIES).toHaveProperty("inceleme");
  });

  it("HABER_CATEGORIES has expected categories", () => {
    expect(HABER_CATEGORIES).toHaveProperty("sirketler");
    expect(HABER_CATEGORIES).toHaveProperty("sektor");
    expect(HABER_CATEGORIES).toHaveProperty("arastirma");
  });

  it("all category values are non-empty strings", () => {
    const allMaps = [YAZI_CATEGORIES, HABER_CATEGORIES];
    for (const map of allMaps) {
      for (const [key, value] of Object.entries(map)) {
        expect(key).toBeTruthy();
        expect(value).toBeTruthy();
        expect(typeof value).toBe("string");
      }
    }
  });
});

// ─── DIFFICULTY ───


