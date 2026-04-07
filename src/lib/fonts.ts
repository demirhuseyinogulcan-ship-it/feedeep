// ─────────────────────────────────────────────────────────────
// feedeep — Font Configuration
// Montserrat: başlıklar | Inter: body text
// ─────────────────────────────────────────────────────────────

import { Montserrat, Inter } from "next/font/google";

export const fontHeading = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-heading",
  display: "swap",
  weight: ["500", "600", "700", "800", "900"],
  fallback: ["system-ui", "Arial", "sans-serif"],
});

export const fontSans = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  fallback: ["system-ui", "Arial", "sans-serif"],
});
