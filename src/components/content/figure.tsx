// ─────────────────────────────────────────────────────────────
// feedeep — Figure Component (MDX içi görsel)
// MDX içeriklerinde <Figure /> ile kullanılır
// ─────────────────────────────────────────────────────────────

import Image from "next/image";

interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  creditUrl?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function Figure({
  src,
  alt,
  caption,
  credit,
  creditUrl,
  width = 1200,
  height = 675,
  priority = false,
}: FigureProps) {
  return (
    <figure className="figure-block">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="figure-img"
        sizes="(max-width: 768px) 100vw, 720px"
      />
      {caption && (
        <figcaption className="figure-caption">
          <span>{caption}</span>
        </figcaption>
      )}
    </figure>
  );
}
