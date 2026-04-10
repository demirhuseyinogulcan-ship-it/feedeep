// ─────────────────────────────────────────────────────────────
// feedeep — Auth Layer
// Supabase Anonymous Auth + opsiyonel username.
// Akış: anonim oturum → profil oluştur → (opsiyonel) email ekle.
// Fake email hack kaldırıldı — Supabase'in resmi anonim auth'u kullanılıyor.
// ─────────────────────────────────────────────────────────────

import { getSupabase, isSupabaseConfigured } from "./supabase";
import { generateUsername } from "./username-generator";

export type AuthUser = {
  id: string;
  username: string;
  isAnonymous: boolean;
};

/** Mevcut oturumu kontrol et */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    username: user.user_metadata?.username ?? "Anonim",
    isAnonymous: user.is_anonymous ?? false,
  };
}

/** Anonim oturum başlat — kullanıcıdan hiçbir şey istenmez.
 *  Zaten anonim oturumu varsa yeni oturum açmaz. */
export async function signInAnonymously(): Promise<{
  user: AuthUser | null;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: "Supabase yapılandırılmamış." };
  }

  const supabase = getSupabase();

  // Mevcut oturum var mı kontrol et
  const { data: { user: existing } } = await supabase.auth.getUser();
  if (existing) {
    return {
      user: {
        id: existing.id,
        username: existing.user_metadata?.username ?? "Anonim",
        isAnonymous: existing.is_anonymous ?? false,
      },
      error: null,
    };
  }

  const username = generateUsername();
  const { data, error } = await supabase.auth.signInAnonymously({
    options: { data: { username } },
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (!data.user) {
    return { user: null, error: "Anonim oturum açılamadı." };
  }

  return {
    user: {
      id: data.user.id,
      username,
      isAnonymous: true,
    },
    error: null,
  };
}

/** Anonim hesabı kalıcı hesaba yükselt — username + şifre ile.
 *  Supabase "linking" kullanır: aynı UUID korunur, tüm veriler kalır. */
export async function claimAccount(
  password: string,
  customUsername?: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: "Supabase yapılandırılmamış." };
  }

  const supabase = getSupabase();
  const username = customUsername ?? generateUsername();

  // Anonim hesabı kalıcıya dönüştür: email + password ekle
  // Fake email hala gerekli çünkü Supabase updateUser email istiyor,
  // ama artık auth flow'un kendisi anonim tabanlı — email sadece internal.
  const fakeEmail = usernameToFakeEmail(username);

  const { data, error } = await supabase.auth.updateUser({
    email: fakeEmail,
    password,
    data: { username },
  });

  if (error) {
    if (
      error.message.includes("already registered") ||
      error.message.includes("duplicate key") ||
      error.message.includes("unique constraint")
    ) {
      return { user: null, error: "Bu kullanıcı adı zaten alınmış." };
    }
    return { user: null, error: error.message };
  }

  if (!data.user) {
    return { user: null, error: "Hesap yükseltilemedi." };
  }

  return {
    user: {
      id: data.user.id,
      username,
      isAnonymous: false,
    },
    error: null,
  };
}

/** Kullanıcı adı ile giriş yap (kalıcı hesaplar için) */
export async function signIn(
  username: string,
  password: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: "Supabase yapılandırılmamış." };
  }

  const supabase = getSupabase();
  const email = usernameToFakeEmail(username);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { user: null, error: "Kullanıcı adı veya şifre yanlış." };
    }
    return { user: null, error: error.message };
  }

  if (!data.user) {
    return { user: null, error: "Giriş yapılamadı." };
  }

  return {
    user: {
      id: data.user.id,
      username: data.user.user_metadata?.username ?? username,
      isAnonymous: false,
    },
    error: null,
  };
}

/** Çıkış yap */
export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabase();
  await supabase.auth.signOut();
}

/** Auth durumu değişikliğini dinle */
export function onAuthChange(callback: (user: AuthUser | null) => void) {
  if (!isSupabaseConfigured()) return { unsubscribe: () => {} };

  const supabase = getSupabase();
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        username: session.user.user_metadata?.username ?? "Anonim",
        isAnonymous: session.user.is_anonymous ?? false,
      });
    } else {
      callback(null);
    }
  });

  return { unsubscribe: () => subscription.unsubscribe() };
}

// ─── Internal Helpers ───

/** Username → deterministic fake e-posta (internal, kullanıcıya gösterilmez).
 *  .invalid TLD — IANA reserved, asla gerçek domain olmayacak. */
function usernameToFakeEmail(username: string): string {
  const slug = username
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "");
  return `${slug}@kullanici.invalid`;
}
