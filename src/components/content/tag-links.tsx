// feedeep — Etiket Linkleri
// İçerik sayfalarında tag'leri gösterir, hub sayfalarına link verir

import Link from "next/link";
import { getTagLabel } from "@/lib/constants";

interface TagLinksProps {
  tags: string[];
}

export function TagLinks({ tags }: TagLinksProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 py-4">
      <span className="text-[10px] font-sans tracking-widest uppercase text-gray-700 self-center">
        Etiketler
      </span>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/etiketler/${tag}`}
          className="px-2 py-1 rounded text-xs text-gray-500 border border-white/[0.06] hover:text-primary-400 hover:border-primary-400/20 transition-colors"
        >
          {getTagLabel(tag)}
        </Link>
      ))}
    </div>
  );
}
