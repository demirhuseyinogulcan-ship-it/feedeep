"use client";

import { useCallback, useRef, type ReactNode, type CSSProperties } from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function TiltCard({ children, className = "", style }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;   // 0..1
    const y = (e.clientY - rect.top) / rect.height;    // 0..1
    const rotateX = (0.5 - y) * 8;   // max ±4deg
    const rotateY = (x - 0.5) * 8;   // max ±4deg
    const glowX = x * 100;
    const glowY = y * 100;

    el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px) scale(1.01)`;
    el.style.boxShadow = `0 8px 30px rgba(139,92,246,0.12), 0 2px 8px rgba(0,0,0,0.3), inset 0 0 60px rgba(139,92,246,0.04)`;
    el.style.backgroundColor = `rgba(139,92,246,0.05)`;
    el.style.setProperty("--glow-x", `${glowX}%`);
    el.style.setProperty("--glow-y", `${glowY}%`);
  }, []);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.boxShadow = "";
    el.style.backgroundColor = "";
    el.style.setProperty("--glow-x", "50%");
    el.style.setProperty("--glow-y", "50%");
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`tilt-card ${className}`}
      style={style}
    >
      {/* Mouse-following glow overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: "radial-gradient(300px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(139,92,246,0.12), transparent 60%)",
        }}
      />
      {children}
    </div>
  );
}
