type OrderableContent = {
  date: string;
  publishedAt?: string;
};

export type ContentSortMode = "latest";

function toTimestamp(value: string | undefined): number {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function getPublicationDate<T extends OrderableContent>(item: T): string {
  return item.publishedAt ?? item.date;
}

function compareByLatest<T extends OrderableContent>(a: T, b: T): number {
  const publicationDiff =
    toTimestamp(getPublicationDate(b)) - toTimestamp(getPublicationDate(a));

  if (publicationDiff !== 0) return publicationDiff;

  return toTimestamp(b.date) - toTimestamp(a.date);
}

const SORTERS: Record<ContentSortMode, typeof compareByLatest> = {
  latest: compareByLatest,
};

export function sortContent<T extends OrderableContent>(
  items: readonly T[],
  mode: ContentSortMode = "latest",
): T[] {
  return [...items].sort(SORTERS[mode]);
}