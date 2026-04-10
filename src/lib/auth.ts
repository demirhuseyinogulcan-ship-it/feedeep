// ─────────────────────────────────────────────────────────────
// feedeep — Auth Layer
// "Tek hayat hesap" — kullanıcı adı + şifre, e-posta yok.
// Supabase Auth üzerinden, username metadata olarak saklanır.
// ─────────────────────────────────────────────────────────────

import { getSupabase, isSupabaseConfigured } from "./supabase";
import { generateUsername } from "./username-generator";

export type AuthUser = {
  id: string;
  username: string;
};

/** Username → deterministic fake e-posta. Supabase Auth e-posta zorunlu kılıyor,
 *  biz kullanıcıdan e-posta istemiyoruz. Aynı username her zaman aynı e-postayı üretir.
 *  .invalid TLD — IANA reserved, asla gerçek domain olmayacak.
 *  Sadece ASCII — Supabase/SMTP Türkçe karakterleri kabul etmiyor. */
function usernameToEmail(username: string): string {
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

/** Mevcut oturumu kontrol et */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    username: user.user_metadata?.username ?? "Anonim",
  };
}

/** Yeni hesap oluştur — kullanıcı adı otomatik atanır */
export async function signUp(
  password: string,
  customUsername?: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: "Supabase yapılandırılmamış." };
  }

  const supabase = getSupabase();
  const username = customUsername ?? generateUsername();

  // Supabase Auth e-posta zorunlu kılıyor.
  // Deterministic fake e-posta: username → e-posta dönüşümü.
  // Giriş sırasında aynı formül ile e-postayı tekrar üretebiliriz.
  const fakeEmail = usernameToEmail(username);

  const { data, error } = await supabase.auth.signUp({
    email: fakeEmail,
    password,
    options: {
      data: { username },
      emailRedirectTo: undefined,
    },
  });

  if (error) {
    if (
      error.message.includes("already registered") ||
      error.message.includes("duplicate key") ||
      error.message.includes("unique constraint") ||
      error.code === "23505"
    ) {
      return { user: null, error: "Bu kullanıcı adı zaten alınmış." };
    }
    // profiles.username UNIQUE trigger ihlali (PostgreSQL 23505)
    if (
      error.message.toLowerCase().includes("duplicate key") ||
      error.message.includes("23505") ||
      error.message.toLowerCase().includes("unique constraint")
    ) {
      return { user: null, error: "Bu kullanıcı adı zaten alınmış." };
    }
    return { user: null, error: error.message };
  }

  if (!data.user) {
    return { user: null, error: "Hesap oluşturulamadı." };
  }

  return {
    user: { id: data.user.id, username },
    error: null,
  };
}

/** Kullanıcı adı ile giriş yap */
export async function signIn(
  username: string,
  password: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: "Supabase yapılandırılmamış." };
  }

  const supabase = getSupabase();

  // Username → deterministic e-posta
  const email = usernameToEmail(username);

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
      });
    } else {
      callback(null);
    }
  });

  return { unsubscribe: () => subscription.unsubscribe() };
}
