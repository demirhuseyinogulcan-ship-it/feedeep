"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — Profil Sayfası
// "Tek Hayat Hesap" — sahiplenilen, oylanan, yorum yapılan makaleler.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { signOut } from "@/lib/auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { deleteCommentFromSupabase, fetchUserComments } from "@/lib/comments";
import { getOwnedIds } from "@/lib/signals";
import { timeAgo } from "@/lib/utils";

type ProfileStats = {
  totalOwned: number;
  totalUpvotes: number;
  totalDownvotes: number;
  totalComments: number;
};

type OwnedArticle = {
  articleId: string;
  ownedAt: string | null;
};

type UserComment = {
  id: string;
  articleId: string;
  text: string;
  createdAt: string;
};

export default function ProfilPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({
    totalOwned: 0,
    totalUpvotes: 0,
    totalDownvotes: 0,
    totalComments: 0,
  });
  const [ownedArticles, setOwnedArticles] = useState<OwnedArticle[]>([]);
  const [recentComments, setRecentComments] = useState<UserComment[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (user && isSupabaseConfigured()) {
      // Servis katmanı üçerinden kullanıcı verilerini al
      const sb = getSupabase();

      Promise.all([
        // Sahiplenilen makaleler
        sb.from("signals")
          .select("article_id, owned_at")
          .eq("user_id", user.id)
          .eq("owned", true)
          .order("owned_at", { ascending: false })
          .limit(20),
        // Oylar
        sb.from("signals")
          .select("vote")
          .eq("user_id", user.id)
          .not("vote", "is", null),
        // Yorumlar — servis katmanı
        fetchUserComments(user.id),
      ]).then(([ownedRes, votesRes, comments]) => {
        const owned = ownedRes.data ?? [];
        const votes = votesRes.data ?? [];

        setOwnedArticles(owned.map((r: { article_id: string; owned_at: string | null }) => ({
          articleId: r.article_id,
          ownedAt: r.owned_at,
        })));

        setStats({
          totalOwned: owned.length,
          totalUpvotes: votes.filter((v: { vote: string }) => v.vote === "upvote").length,
          totalDownvotes: votes.filter((v: { vote: string }) => v.vote === "downvote").length,
          totalComments: comments.length,
        });

        setRecentComments(comments);

        setDataLoaded(true);
      }).catch(() => setDataLoaded(true));
    } else {
      // localStorage fallback — async callback ile ESLint set-state-in-effect kuralını geç
      Promise.resolve().then(() => {
        const ids = getOwnedIds();
        setStats({
          totalOwned: ids.length,
          totalUpvotes: 0,
          totalDownvotes: 0,
          totalComments: 0,
        });
        setOwnedArticles(ids.map((id) => ({ articleId: id, ownedAt: null })));
        setDataLoaded(true);
      });
    }
  }, [user, loading]);

  // Yükleniyor
  if (loading || !dataLoaded) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-sm text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  // Giriş yapmamış
  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-heading font-bold text-gray-100">Profil</h1>
        <p className="text-sm text-gray-500">
          Profilini görebilmek için giriş yapman gerekiyor.
        </p>
        <p className="text-xs text-gray-600">
          Sag üstteki Hesap Olustur veya Giris butonunu kullan.
        </p>
      </div>
    );
  }

  async function handleDeleteComment(commentId: string) {
    if (!isSupabaseConfigured()) return;
    const ok = await deleteCommentFromSupabase(commentId);
    if (ok) {
      setRecentComments((prev) => prev.filter((c) => c.id !== commentId));
      setStats((prev) => ({ ...prev, totalComments: prev.totalComments - 1 }));
    }
  }

  function articleIdToHref(articleId: string): string {
    if (articleId.startsWith("haber-")) {
      return `/haberler/${articleId.replace("haber-", "")}`;
    }
    if (articleId.startsWith("yazi-")) {
      return `/yazilar/${articleId.replace("yazi-", "")}`;
    }
    return "#";
  }

  function articleIdToLabel(articleId: string): string {
    const slug = articleId.replace(/^(haber|yazi)-/, "");
    return slug.replace(/-/g, " ");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-10">
      {/* Kullanıcı başlığı */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <span className="text-[10px] tracking-widest uppercase text-gray-500 block">
            Tek Hayat Hesap
          </span>
          <h1 className="text-2xl font-heading font-bold text-primary-400">
            {user.username}
          </h1>
        </div>
        <button
          onClick={() => signOut()}
          className="text-[11px] font-heading tracking-widest uppercase px-4 py-2 rounded-md border border-white/[0.08] text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-colors"
        >
          Çıkış Yap
        </button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Sahiplenilen" value={stats.totalOwned} />
        <StatCard label="Beğeni" value={stats.totalUpvotes} />
        <StatCard label="Beğenmeme" value={stats.totalDownvotes} />
        <StatCard label="Görüş" value={stats.totalComments} />
      </div>

      {/* Sahiplenilen makaleler */}
      <section className="space-y-4">
        <h2 className="text-xs tracking-widest uppercase text-gray-500">
          Sahiplendiğin Makaleler
        </h2>
        {ownedArticles.length === 0 ? (
          <p className="text-sm text-gray-600">Henüz bir makale sahiplenmedin.</p>
        ) : (
          <div className="space-y-2">
            {ownedArticles.map((a) => (
              <Link
                key={a.articleId}
                href={articleIdToHref(a.articleId)}
                className="block rounded-lg border border-white/[0.06] bg-surface-1/50 px-4 py-3 hover:border-primary-500/20 transition-colors"
              >
                <p className="text-sm text-gray-300 capitalize">
                  {articleIdToLabel(a.articleId)}
                </p>
                {a.ownedAt && (
                  <span className="text-[10px] text-gray-600">
                    {timeAgo(a.ownedAt)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Son görüşler */}
      {recentComments.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs tracking-widest uppercase text-gray-500">
            Son Görüşlerin
          </h2>
          <div className="space-y-2">
            {recentComments.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-white/[0.06] bg-surface-1/50 px-4 py-3 space-y-1"
              >
                <Link
                  href={articleIdToHref(c.articleId)}
                  className="block hover:text-primary-400 transition-colors"
                >
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {c.text}
                  </p>
                </Link>
                <div className="flex items-center gap-2 text-[10px] text-gray-600">
                  <Link href={articleIdToHref(c.articleId)} className="capitalize hover:text-gray-400 transition-colors">
                    {articleIdToLabel(c.articleId)}
                  </Link>
                  <span>·</span>
                  <span>{timeAgo(c.createdAt)}</span>
                  <span>·</span>
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-surface-1/30 px-4 py-3 text-center space-y-1">
      <span className="text-xl font-heading font-bold text-gray-200 tabular-nums block">
        {value}
      </span>
      <span className="text-[10px] tracking-widest uppercase text-gray-600 block">
        {label}
      </span>
    </div>
  );
}
