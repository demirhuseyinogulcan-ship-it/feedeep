// Small "made by" mark linking to the studio that built the site.
const COMMITIUS_URL = "https://commitius.com";

const COLUMN_PATHS = [
  "M14.3 4.8H49.7Q51.2 4.8 51.2 6.3V8.8Q51.2 10.3 49.7 10.3H14.3Q12.8 10.3 12.8 8.8V6.3Q12.8 4.8 14.3 4.8Z",
  "M17.6 12.5H46.4Q47.2 12.5 46.9 13.3L45.3 17.2Q45 18 44.2 18H19.8Q19 18 18.7 17.2L17.1 13.3Q16.8 12.5 17.6 12.5Z",
  "M20.9 19.8H25.7L25.6 58.1Q25.6 59.3 24.4 59.3H21.6Q20.4 59.3 20.4 58.1Z",
  "M29.6 19.8H34.4V58.1Q34.4 59.3 33.2 59.3H30.8Q29.6 59.3 29.6 58.1Z",
  "M38.3 19.8H43.1L43.6 58.1Q43.6 59.3 42.4 59.3H39.6Q38.4 59.3 38.4 58.1Z",
];

export function CommitiusCredit({ className = "" }: { className?: string }) {
  return (
    <a
      href={COMMITIUS_URL}
      target="_blank"
      rel="noopener"
      className={`inline-flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100 ${className}`}
    >
      <svg viewBox="0 0 64 64" width="14" height="14" fill="currentColor" aria-hidden="true">
        {COLUMN_PATHS.map((path) => (
          <path key={path} d={path} />
        ))}
      </svg>
      <span>commitius</span>
    </a>
  );
}
