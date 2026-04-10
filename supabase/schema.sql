-- ─────────────────────────────────────────────────────────────
-- AI Rehber — Supabase Database Schema
-- Bu SQL'i Supabase Dashboard → SQL Editor'de çalıştır.
-- Sırayla çalıştır, her bölümü ayrı ayrı da çalıştırabilirsin.
-- ─────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════
-- 1. PROFILES — Kullanıcı profilleri
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Herkes okuyabilir, sadece kendi profilini güncelleyebilir
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiller herkese açık"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Kendi profilini güncelle"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════
-- 2. SIGNALS — Sahip Ol + Beğen/Beğenme
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,
  owned BOOLEAN DEFAULT false,
  vote TEXT CHECK (vote IN ('upvote', 'downvote')) DEFAULT NULL,
  owned_at TIMESTAMPTZ DEFAULT NULL,
  voted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, article_id)
);

CREATE INDEX idx_signals_article ON public.signals(article_id);
CREATE INDEX idx_signals_user ON public.signals(user_id);

-- RLS
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sinyaller herkese açık (okuma)"
  ON public.signals FOR SELECT
  USING (true);

CREATE POLICY "Kendi sinyalini ekle"
  ON public.signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kendi sinyalini güncelle"
  ON public.signals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kendi sinyalini sil"
  ON public.signals FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- 3. COMMENTS — Threaded yorumlar
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL,
  text TEXT NOT NULL CHECK (char_length(text) <= 1000),
  image_url TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_article ON public.comments(article_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);

-- RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Yorumlar herkese açık"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Giriş yapanlar yorum ekleyebilir"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kendi yorumunu sil"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- 4. COMMENT_VOTES — Yorum oyları
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.comment_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

CREATE INDEX idx_comment_votes_comment ON public.comment_votes(comment_id);

-- RLS
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Yorum oyları herkese açık"
  ON public.comment_votes FOR SELECT
  USING (true);

CREATE POLICY "Giriş yapanlar oy verebilir"
  ON public.comment_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kendi oyunu güncelle"
  ON public.comment_votes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kendi oyunu sil"
  ON public.comment_votes FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- 6. FUNCTION: Tekil makale istatistiği (slug sayfaları için)
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_article_stats(p_article_id TEXT)
RETURNS TABLE (
  total_owners INTEGER,
  total_upvotes INTEGER,
  total_downvotes INTEGER,
  total_comments INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.signals WHERE article_id = p_article_id AND owned = true), 0),
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.signals WHERE article_id = p_article_id AND vote = 'upvote'), 0),
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.signals WHERE article_id = p_article_id AND vote = 'downvote'), 0),
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.comments WHERE article_id = p_article_id), 0);
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- 6b. FUNCTION: Toplu makale istatistikleri (feed için)
-- Feed'deki N kart → tek RPC çağrısı. Server-side GROUP BY ile
-- client'a satır bazında veri gönderilmez; sadece toplamlar döner.
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_batch_article_stats(article_ids TEXT[])
RETURNS TABLE (
  article_id TEXT,
  total_owners INTEGER,
  total_upvotes INTEGER,
  total_downvotes INTEGER,
  total_comments INTEGER
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    a.id                                                          AS article_id,
    COALESCE(s.owners,    0)::INTEGER                             AS total_owners,
    COALESCE(s.upvotes,   0)::INTEGER                             AS total_upvotes,
    COALESCE(s.downvotes, 0)::INTEGER                             AS total_downvotes,
    COALESCE(c.cnt,       0)::INTEGER                             AS total_comments
  FROM unnest(article_ids) AS a(id)
  LEFT JOIN (
    SELECT
      sig.article_id,
      COUNT(*) FILTER (WHERE sig.owned = true)    AS owners,
      COUNT(*) FILTER (WHERE sig.vote = 'upvote') AS upvotes,
      COUNT(*) FILTER (WHERE sig.vote = 'downvote') AS downvotes
    FROM public.signals AS sig
    WHERE sig.article_id = ANY(article_ids)
    GROUP BY sig.article_id
  ) s ON s.article_id = a.id
  LEFT JOIN (
    SELECT co.article_id, COUNT(*) AS cnt
    FROM public.comments AS co
    WHERE co.article_id = ANY(article_ids)
    GROUP BY co.article_id
  ) c ON c.article_id = a.id;
$$;

-- ═══════════════════════════════════════════════════════════
-- 7. TRIGGER: Kayıt olunca otomatik profil oluştur
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username');
  RETURN NEW;
END;
$$;

-- Auth tablosuna trigger ekle
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════
-- 8. STORAGE: Yorum görselleri için bucket
-- ═══════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comment-images',
  'comment-images',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Herkes görsel görebilir"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'comment-images');

CREATE POLICY "Giriş yapanlar görsel yükleyebilir"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'comment-images' AND auth.role() = 'authenticated');

CREATE POLICY "Kendi görselini sil"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'comment-images' AND auth.uid() = owner);

-- ═══════════════════════════════════════════════════════════
-- 9. MIGRATION: signals tablosuna updated_at kolonu ekle
-- Mevcut tablo varsa ALTER ile ekle, yoksa CREATE'deki default kullanılır.
-- Supabase Dashboard → SQL Editor'de çalıştır.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.signals
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
