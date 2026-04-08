// ─────────────────────────────────────────────────────────────
// feedeep — Font Configuration
// Montserrat: başlıklar | Inter: body text
// ─────────────────────────────────────────────────────────────

import { Montserrat, Inter } from "next/font/google";

// weight belirtilmemis = Google Fonts variable font versiyonu kullanilir.
// Onceki: 5 ayri static dosya (5 × ~15KB = ~75KB, 5 istek)
// Simdi:  1 variable font dosyasi (tam agirlik ekseni dahil, 1 istek)
export const fontHeading = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-heading",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});

export const fontSans = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});
