// ─────────────────────────────────────────────────────────────
// feedeep — Structured Logger
// Development: console.error (stack trace ile)
// Production: console.error (Sentry ready — gelecekte buraya eklenecek)
// Kullanım: logger.error("bağlam", error, { ek: "veri" })
// ─────────────────────────────────────────────────────────────

type LogContext = Record<string, unknown>;

function formatMessage(context: string, extra?: LogContext): string {
  return extra
    ? `[feedeep/${context}] ${JSON.stringify(extra)}`
    : `[feedeep/${context}]`;
}

export const logger = {
  error(context: string, error: unknown, extra?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      console.error(formatMessage(context, extra), error);
      return;
    }
    // Production: sadece mesaj (stack trace olmadan)
    const message = error instanceof Error ? error.message : String(error);
    console.error(formatMessage(context, { ...extra, message }));
    // TODO: Sentry.captureException(error, { extra: { context, ...extra } });
  },

  warn(context: string, message: string, extra?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      console.warn(formatMessage(context, extra), message);
    }
  },
} as const;
