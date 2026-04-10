// ─────────────────────────────────────────────────────────────
// feedeep — Auth Layer Tests
// Supabase Anonymous Auth + claimAccount iş mantığı testi.
// Supabase çağrıları mock'lanır — saf iş mantığı test edilir.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from "vitest";

// Supabase modülünü mock'la — auth.ts import etmeden önce
vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: vi.fn(() => true),
  getSupabase: vi.fn(),
}));

import { isSupabaseConfigured, getSupabase } from "@/lib/supabase";

// ─── usernameToFakeEmail — deterministic email dönüşümü ───
// Bu private fonksiyon doğrudan test edilemez, ama davranışı claimAccount/signIn üzerinden test edilebilir.

describe("Auth — usernameToFakeEmail davranışı", () => {

  let capturedEmail: string | null = null;

  beforeEach(() => {
    capturedEmail = null;

    const mockAuth = {
      getUser: vi.fn(async () => ({
        data: {
          user: {
            id: "anon-uuid",
            user_metadata: { username: "AnonUser" },
            is_anonymous: true,
          },
        },
      })),
      updateUser: vi.fn(async ({ email }: { email: string }) => {
        capturedEmail = email;
        return {
          data: {
            user: {
              id: "anon-uuid",
              user_metadata: { username: "TestKullanici" },
              is_anonymous: false,
            },
          },
          error: null,
        };
      }),
      signInWithPassword: vi.fn(async ({ email }: { email: string }) => {
        capturedEmail = email;
        return {
          data: {
            user: {
              id: "test-uuid",
              user_metadata: { username: "TestKullanici" },
              is_anonymous: false,
            },
          },
          error: null,
        };
      }),
    };

    vi.mocked(getSupabase).mockReturnValue({
      auth: mockAuth,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it("claimAccount .invalid TLD kullanır", async () => {
    const { claimAccount } = await import("@/lib/auth");
    await claimAccount("password123", "PixelIblisi");
    expect(capturedEmail).toMatch(/@kullanici\.invalid$/);
  });

  it("claimAccount username'i lowercase ASCII slug yapar (Turkce karakterler donusturulur)", async () => {
    const { claimAccount } = await import("@/lib/auth");
    await claimAccount("password123", "BulutMühendisi");
    expect(capturedEmail).toMatch(/^bulutmuhendisi@/);
  });

  it("signIn aynı username'den aynı email üretir", async () => {
    const { signIn } = await import("@/lib/auth");
    await signIn("PixelIblisi", "password123");
    expect(capturedEmail).toMatch(/@kullanici\.invalid$/);
  });

  it("deterministic: claimAccount ve signIn aynı email üretir", async () => {
    const { claimAccount, signIn } = await import("@/lib/auth");
    await claimAccount("password123", "TestKullanici");
    const claimEmail = capturedEmail;
    await signIn("TestKullanici", "password123");
    const signInEmail = capturedEmail;
    expect(claimEmail).toBe(signInEmail);
  });
});

// ─── signInAnonymously — anonim oturum ───

describe("signInAnonymously()", () => {
  beforeEach(() => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  it("mevcut oturum varsa yeni oturum açmaz", async () => {
    const mockAuth = {
      getUser: vi.fn(async () => ({
        data: {
          user: {
            id: "existing-uuid",
            user_metadata: { username: "MevcutKullanici" },
            is_anonymous: false,
          },
        },
      })),
      signInAnonymously: vi.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getSupabase).mockReturnValue({ auth: mockAuth } as any);

    const { signInAnonymously } = await import("@/lib/auth");
    const result = await signInAnonymously();
    expect(result.user).toBeDefined();
    expect(result.user!.id).toBe("existing-uuid");
    expect(mockAuth.signInAnonymously).not.toHaveBeenCalled();
  });

  it("oturum yoksa anonim oturum açar", async () => {
    const mockAuth = {
      getUser: vi.fn(async () => ({
        data: { user: null },
      })),
      signInAnonymously: vi.fn(async () => ({
        data: {
          user: {
            id: "anon-uuid",
            user_metadata: { username: "OtomatikIsim" },
            is_anonymous: true,
          },
        },
        error: null,
      })),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getSupabase).mockReturnValue({ auth: mockAuth } as any);

    const { signInAnonymously } = await import("@/lib/auth");
    const result = await signInAnonymously();
    expect(result.user).toBeDefined();
    expect(result.user!.isAnonymous).toBe(true);
    expect(result.error).toBeNull();
  });

  it("Supabase yapılandırılmamışsa hata döner", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
    const { signInAnonymously } = await import("@/lib/auth");
    const result = await signInAnonymously();
    expect(result.error).toBe("Supabase yapılandırılmamış.");
  });
});

// ─── claimAccount — anonim hesabı kalıcıya yükselt ───

describe("claimAccount()", () => {
  beforeEach(() => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  it("başarılı yükseltmede user döner ve isAnonymous false olur", async () => {
    const mockAuth = {
      updateUser: vi.fn(async () => ({
        data: {
          user: {
            id: "uuid-1",
            user_metadata: { username: "TestUser" },
            is_anonymous: false,
          },
        },
        error: null,
      })),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getSupabase).mockReturnValue({ auth: mockAuth } as any);

    const { claimAccount } = await import("@/lib/auth");
    const result = await claimAccount("password123", "TestUser");
    expect(result.user).toBeDefined();
    expect(result.user!.username).toBe("TestUser");
    expect(result.user!.isAnonymous).toBe(false);
    expect(result.error).toBeNull();
  });

  it("Supabase yapılandırılmamışsa hata döner", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
    const { claimAccount } = await import("@/lib/auth");
    const result = await claimAccount("password123");
    expect(result.error).toBe("Supabase yapılandırılmamış.");
    expect(result.user).toBeNull();
  });

  it("zaten varolan kullanıcı Türkçe hata döner", async () => {
    const mockAuth = {
      updateUser: vi.fn(async () => ({
        data: { user: null },
        error: { message: "User already registered" },
      })),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getSupabase).mockReturnValue({ auth: mockAuth } as any);

    const { claimAccount } = await import("@/lib/auth");
    const result = await claimAccount("password123", "VarOlan");
    expect(result.error).toBe("Bu kullanıcı adı zaten alınmış.");
  });
});

// ─── signIn — giriş ───

describe("signIn()", () => {
  beforeEach(() => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  it("başarılı girişte user döner", async () => {
    const mockAuth = {
      signInWithPassword: vi.fn(async () => ({
        data: {
          user: {
            id: "uuid-1",
            user_metadata: { username: "TestUser" },
            is_anonymous: false,
          },
        },
        error: null,
      })),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getSupabase).mockReturnValue({ auth: mockAuth } as any);

    const { signIn } = await import("@/lib/auth");
    const result = await signIn("TestUser", "password123");
    expect(result.user).toBeDefined();
    expect(result.error).toBeNull();
  });

  it("yanlış şifrede Türkçe hata döner", async () => {
    const mockAuth = {
      signInWithPassword: vi.fn(async () => ({
        data: { user: null },
        error: { message: "Invalid login credentials" },
      })),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getSupabase).mockReturnValue({ auth: mockAuth } as any);

    const { signIn } = await import("@/lib/auth");
    const result = await signIn("TestUser", "wrongpassword");
    expect(result.error).toBe("Kullanıcı adı veya şifre yanlış.");
  });

  it("Supabase yapılandırılmamışsa hata döner", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
    const { signIn } = await import("@/lib/auth");
    const result = await signIn("user", "pass");
    expect(result.error).toBe("Supabase yapılandırılmamış.");
  });
});
