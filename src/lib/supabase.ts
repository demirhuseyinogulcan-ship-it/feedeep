// ─────────────────────────────────────────────────────────────
// feedeep — Supabase Client
// Tek bir istemci örneği — tüm uygulama bunu kullanır.
// ─────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let client: SupabaseClient | null = null;

/** Supabase yapılandırılmış mı kontrol et */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/** Supabase istemcisi al — singleton */
export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase URL veya Anon Key tanımlı değil. .env.local dosyasını kontrol et.");
    }
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return client;
}

/** Oturumdaki kullanıcı ID'sini hızla al — getSession() bellekten okur,
 *  getUser() aksine network isteği yapmaz ve auth token kilidini almaz.
 *  Veri katmanı sorgularında (signals, comments) bunu kullan. */
export async function getSessionUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  return session?.user?.id ?? null;
}
