// ─────────────────────────────────────────────────────────────
// AI Rehber — Copy Button (Client Component)
// Prompt metinlerini panoya kopyalar
// ─────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Fallback for older browsers
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
      setCopied(true);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`text-xs font-sans transition-colors ${
        copied ? "text-gray-300" : "text-gray-600 hover:text-gray-400"
      } ${className ?? ""}`}
      aria-label={copied ? "Kopyalandı" : "Panoya kopyala"}
    >
      {copied ? "Kopyalandı" : "Kopyala"}
    </button>
  );
}
