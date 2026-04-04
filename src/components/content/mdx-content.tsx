// ─────────────────────────────────────────────────────────────
// AI Rehber — MDX Content Renderer
// Velite'den gelen derlenmiş MDX kodunu React component'e çevirir
// ─────────────────────────────────────────────────────────────

import * as runtime from "react/jsx-runtime";
import { Figure } from "@/components/content/figure";

/** MDX içinde kullanılabilecek özel bileşenler */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultComponents: Record<string, React.ComponentType<any>> = {
  Figure,
};

function getMDXComponent(code: string) {
  const fn = new Function(code);
  return fn({ ...runtime }).default;
}

interface MDXContentProps {
  code: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components?: Record<string, React.ComponentType<any>>;
}

export function MDXContent({ code, components = {} }: MDXContentProps) {
  const Component = getMDXComponent(code);
  return (
    <div className="prose">
      {Component({ components: { ...defaultComponents, ...components } })}
    </div>
  );
}
