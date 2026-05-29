-- Security hardening for public user data, storage uploads, push subscriptions, and view counters.

-- Push subscriptions are only accessed by trusted server routes with the service role key.
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.push_subscriptions FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.push_subscriptions TO service_role;

-- Raw per-user signals and comment votes should not be publicly enumerable.
DROP POLICY IF EXISTS "Sinyaller herkese açık (okuma)" ON public.signals;
DROP POLICY IF EXISTS signals_select_own ON public.signals;
CREATE POLICY signals_select_own
  ON public.signals FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL AND (select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Yorum oyları herkese açık" ON public.comment_votes;
DROP POLICY IF EXISTS comment_votes_select_own ON public.comment_votes;
CREATE POLICY comment_votes_select_own
  ON public.comment_votes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL AND (select auth.uid()) = user_id);

-- Public aggregate RPCs can read all rows, but only return counts.
CREATE OR REPLACE FUNCTION public.get_batch_article_stats(article_ids TEXT[])
RETURNS TABLE (
  article_id TEXT,
  total_owners INTEGER,
  total_upvotes INTEGER,
  total_downvotes INTEGER,
  total_comments INTEGER,
  total_views BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.id AS article_id,
    COALESCE(s.owners, 0)::INTEGER AS total_owners,
    COALESCE(s.upvotes, 0)::INTEGER AS total_upvotes,
    COALESCE(s.downvotes, 0)::INTEGER AS total_downvotes,
    COALESCE(c.cnt, 0)::INTEGER AS total_comments,
    COALESCE(v.view_count, 0)::BIGINT AS total_views
  FROM unnest(article_ids) AS a(id)
  LEFT JOIN (
    SELECT
      sig.article_id,
      COUNT(*) FILTER (WHERE sig.owned = true) AS owners,
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
  ) c ON c.article_id = a.id
  LEFT JOIN public.article_views v ON v.article_id = a.id;
$$;

CREATE OR REPLACE FUNCTION public.get_article_stats(p_article_id TEXT)
RETURNS TABLE (
  total_owners INTEGER,
  total_upvotes INTEGER,
  total_downvotes INTEGER,
  total_comments INTEGER,
  total_views BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.signals WHERE article_id = p_article_id AND owned = true), 0),
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.signals WHERE article_id = p_article_id AND vote = 'upvote'), 0),
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.signals WHERE article_id = p_article_id AND vote = 'downvote'), 0),
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.comments WHERE article_id = p_article_id), 0),
    COALESCE((SELECT view_count FROM public.article_views WHERE article_id = p_article_id), 0)::BIGINT;
END;
$$;

REVOKE ALL ON FUNCTION public.get_batch_article_stats(TEXT[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_article_stats(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_batch_article_stats(TEXT[]) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_article_stats(TEXT) TO anon, authenticated, service_role;

-- View increments are performed by the server API with service_role after slug and Redis checks.
CREATE OR REPLACE FUNCTION public.increment_view(p_article_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_article_id !~ '^(haber|yazi)-[a-z0-9-]{1,170}$' THEN
    RAISE EXCEPTION 'invalid_article_id';
  END IF;

  INSERT INTO public.article_views (article_id, view_count, updated_at)
  VALUES (p_article_id, 1, now())
  ON CONFLICT (article_id)
  DO UPDATE SET view_count = article_views.view_count + 1, updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.increment_view(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_view(TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_view(TEXT) TO service_role;

-- Enforce a database-level comment throttle. The client-side limiter cannot be trusted.
CREATE OR REPLACE FUNCTION public.enforce_comment_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.comments
    WHERE user_id = NEW.user_id
      AND created_at > now() - interval '30 seconds'
  ) THEN
    RAISE EXCEPTION 'comment_rate_limited';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_comment_rate_limit_on_comments ON public.comments;
CREATE TRIGGER enforce_comment_rate_limit_on_comments
  BEFORE INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_comment_rate_limit();

-- Restrict public comment image uploads to the authenticated user's own top-level folder.
DROP POLICY IF EXISTS "Giriş yapanlar görsel yükleyebilir" ON storage.objects;
DROP POLICY IF EXISTS comment_images_insert_own_folder ON storage.objects;
CREATE POLICY comment_images_insert_own_folder
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'comment-images'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );
