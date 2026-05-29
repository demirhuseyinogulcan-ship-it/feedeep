-- Follow-up hardening from Supabase advisors.

-- Stats RPCs are now called by /api/stats with the service role, not directly by browsers.
REVOKE ALL ON FUNCTION public.get_batch_article_stats(TEXT[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_batch_article_stats(TEXT[]) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_batch_article_stats(TEXT[]) TO service_role;

REVOKE ALL ON FUNCTION public.get_article_stats(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_article_stats(TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_article_stats(TEXT) TO service_role;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- Public bucket URLs keep working without a broad object-listing SELECT policy.
DROP POLICY IF EXISTS "Herkes görsel görebilir" ON storage.objects;

-- Keep the table closed while avoiding the "RLS enabled no policy" advisor for this app table.
DROP POLICY IF EXISTS push_subscriptions_no_public_access ON public.push_subscriptions;
CREATE POLICY push_subscriptions_no_public_access
  ON public.push_subscriptions
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Set a stable search path for the public popular-articles RPC.
CREATE OR REPLACE FUNCTION public.get_popular_articles(p_limit INTEGER DEFAULT 5)
RETURNS TABLE (article_id TEXT, view_count BIGINT)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT av.article_id, av.view_count
  FROM public.article_views av
  WHERE av.view_count > 0
  ORDER BY av.view_count DESC
  LIMIT p_limit;
$$;
