type FaqItem = {
  question: string;
  answer: string;
};

type FaqSectionProps = {
  items: FaqItem[];
};

export function FaqSection({ items }: FaqSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-12 space-y-5 animate-fade-up delay-300">
      <div>
        <span className="text-[10px] font-sans tracking-widest uppercase text-gray-700 block mb-2">
          Sık Sorulanlar
        </span>
        <h2 className="text-xl font-bold text-gray-200 tracking-tight">
          Kısa Cevaplar
        </h2>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.question}
            className="border-t border-white/[0.04] pt-4"
          >
            <h3 className="text-sm font-semibold text-gray-300">
              {item.question}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
