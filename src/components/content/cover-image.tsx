// ─────────────────────────────────────────────────────────────
// AI Rehber — Cover Image (Hero görsel — makale başı)
// Haber/yazı detay sayfalarında ArticleHeader altına eklenir
// ─────────────────────────────────────────────────────────────

import Image from "next/image";

interface CoverImageProps {
  src: string;
  alt: string;
  credit?: string;
  creditUrl?: string;
  priority?: boolean;
  blurDataURL?: string;
}

export function CoverImage({
  src,
  alt,
  credit,
  creditUrl,
  priority = true,
  blurDataURL,
}: CoverImageProps) {
  return (
    <figure className="cover-image">
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={675}
        priority={priority}
        className="cover-image-img"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 720px, 720px"
        {...(blurDataURL ? { placeholder: "blur", blurDataURL } : {})}
      />
      {credit && (
        <figcaption className="cover-image-caption">
          {creditUrl ? (
            <a href={creditUrl} target="_blank" rel="noopener noreferrer">
              {credit}
            </a>
          ) : (
            credit
          )}
        </figcaption>
      )}
    </figure>
  );
}
