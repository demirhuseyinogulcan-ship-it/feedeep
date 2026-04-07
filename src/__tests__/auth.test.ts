// ─────────────────────────────────────────────────────────────
// feedeep — Auth Layer Tests
// "Tek Hayat Hesap" iş mantığı testi.
// Supabase çağrıları mock'lanır — saf iş mantığı test edilir.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from "vitest";

// Supabase modülünü mock'la — auth.ts import etmeden önce
vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: vi.fn(() => true),
  getSupabase: vi.fn(),
}));

import { isSupabaseConfigured, getSupabase } from "@/lib/supabase";

// ─── usernameToEmail — deterministic email dönüşümü ───
// Bu private fonksiyon doğrudan test edilemez, ama davranışı signUp/signIn üzerinden test edilebilir.
// Onun yerine formatı doğrulayan entegrasyon testi yazıyoruz.

describe("Auth — usernameToEmail davranışı", () => {
   
  let capturedEmail: string | null = null;

  beforeEach(() => {
    capturedEmail = null;

    const mockAuth = {
      signUp: vi.fn(async ({ email }: { email: string }) => {
        capturedEmail = email;
        return {
          data: {
            user: {
              id: "test-uuid",
              user_metadata: { username: "TestKullanici" },
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
            },
          },
          error: null,
        };
      }),
      getUser: vi.fn(async () => ({
        data: { user: null },
      })),
    };

    vi.mocked(getSupabase).mockReturnValue({
      auth: mockAuth,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it("signUp .invalid TLD kullanır", async () => {
    // Modülü her testte yeniden import et (mock'un taze olması için)
    const { signUp } = await import("@/lib/auth");
    await signUp("password123", "PixelIblisi");
    expect(capturedEmail).toMatch(/@kullanici\.invalid$/);
  });

  it("signUp username'i lowercase ASCII slug yapar (Turkce karakterler donusturulur)", async () => {
    const { signUp } = await import("@/lib/auth");
    await signUp("password123", "BulutMühendisi");
    expect(capturedEmail).toMatch(/^bulutmuhendisi@/);
  });

  it("signIn aynı username'den aynı email üretir", async () => {
    const { signIn } = await import("@/lib/auth");
    await signIn("PixelIblisi", "password123");
    expect(capturedEmail).toMatch(/@kullanici\.invalid$/);
  });

  it("deterministic: aynı username her zaman aynı email", async () => {
    const { signUp, signIn } = await import("@/lib/auth");
    await signUp("password123", "TestKullanici");
    const signUpEmail = capturedEmail;
    await signIn("TestKullanici", "password123");
    const signInEmail = capturedEmail;
    expect(signUpEmail).toBe(signInEmail);
  });
});

// ─── signUp — hesap oluşturma ───

describe("signUp()", () => {
  beforeEach(() => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  it("başarılı kayıtta user döner", async () => {
    const mockAuth = {
      signUp: vi.fn(async () => ({
        data: {
          user: {
            id: "uuid-1",
            user_metadata: { username: "TestUser" },
          },
        },
        error: null,
      })),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getSupabase).mockReturnValue({ auth: mockAuth } as any);

    const { signUp } = await import("@/lib/auth");
    const result = await signUp("password123", "TestUser");
    expect(result.user).toBeDefined();
    expect(result.user!.username).toBe("TestUser");
    expect(result.error).toBeNull();
  });

  it("Supabase yapılandırılmamışsa hata döner", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
    const { signUp } = await import("@/lib/auth");
    const result = await signUp("password123");
    expect(result.error).toBe("Supabase yapılandırılmamış.");
    expect(result.user).toBeNull();
  });

  it("zaten varolan kullanıcı Türkçe hata döner", async () => {
    const mockAuth = {
      signUp: vi.fn(async () => ({
        data: { user: null },
        error: { message: "User already registered" },
      })),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getSupabase).mockReturnValue({ auth: mockAuth } as any);

    const { signUp } = await import("@/lib/auth");
    const result = await signUp("password123", "VarOlan");
    expect(result.error).toBe("Bu kullanıcı adı zaten alınmış.");
  });

  it("kullanıcı adı belirtilmezse otomatik üretir", async () => {
    const mockAuth = {
      signUp: vi.fn(async ({ options }: { options: { data: { username: string } } }) => ({
        data: {
          user: {
            id: "uuid-auto",
            user_metadata: { username: options.data.username },
          },
        },
        error: null,
      })),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getSupabase).mockReturnValue({ auth: mockAuth } as any);

    const { signUp } = await import("@/lib/auth");
    const result = await signUp("password123");
    expect(result.user).toBeDefined();
    expect(result.user!.username).toBeTruthy();
    expect(result.user!.username.length).toBeGreaterThan(0);
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
