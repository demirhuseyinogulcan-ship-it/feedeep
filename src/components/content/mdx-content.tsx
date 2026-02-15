// ─────────────────────────────────────────────────────────────
// AI Rehber — MDX Content Renderer
// Velite'den gelen derlenmiş MDX kodunu React component'e çevirir
// ─────────────────────────────────────────────────────────────

import * as runtime from "react/jsx-runtime";

const useMDXComponent = (code: string) => {
  const fn = new Function(code);
  return fn({ ...runtime }).default;
};

interface MDXContentProps {
  code: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components?: Record<string, React.ComponentType<any>>;
}

export function MDXContent({ code, components = {} }: MDXContentProps) {
  const Component = useMDXComponent(code);
  return (
    <div className="prose">
      <Component components={components} />
    </div>
  );
}
