import { getPublicationDate } from "@/lib/content-order";

type RelatableContent = {
  slug: string;
  date: string;
  publishedAt?: string;
  published?: boolean;
  category?: string;
  keywords?: string[];
  tags?: string[];
};

type PickRelatedOptions = {
  maxItems?: number;
  includeCategory?: boolean;
};

function countOverlap(left: readonly string[] = [], right: readonly string[] = []) {
  if (left.length === 0 || right.length === 0) return 0;

  const rightSet = new Set(right);
  let overlap = 0;

  for (const value of left) {
    if (rightSet.has(value)) overlap++;
  }

  return overlap;
}

function pairHash(sourceSlug: string, candidateSlug: string) {
  let hash = 0;
  const pair = `${sourceSlug}:${candidateSlug}`;

  for (let index = 0; index < pair.length; index++) {
    hash = (hash * 33 + pair.charCodeAt(index)) % 2147483647;
  }

  return hash;
}

export function pickRelatedContent<
  TSource extends RelatableContent,
  TCandidate extends RelatableContent,
>(
  source: TSource,
  candidates: readonly TCandidate[],
  options: PickRelatedOptions = {},
): TCandidate[] {
  const { maxItems = 3, includeCategory = true } = options;

  return candidates
    .filter((candidate) => candidate.slug !== source.slug && candidate.published !== false)
    .map((candidate) => {
      const sharedTags = countOverlap(source.tags, candidate.tags);
      const sharedKeywords = countOverlap(source.keywords, candidate.keywords);
      const sameCategory = includeCategory && source.category === candidate.category;
      const score = (sharedTags * 12) + (sharedKeywords * 5) + (sameCategory ? 2 : 0);

      return {
        candidate,
        score,
        tieBreaker: pairHash(source.slug, candidate.slug),
        publishedAt: new Date(getPublicationDate(candidate)).getTime(),
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (right.tieBreaker !== left.tieBreaker) return right.tieBreaker - left.tieBreaker;
      return right.publishedAt - left.publishedAt;
    })
    .slice(0, maxItems)
    .map((entry) => entry.candidate);
}