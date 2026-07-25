"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function InteractiveBackground() {
  const glowRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const glow = glowRef.current;
    if (!glow) return;

    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      glow.style.transform = `translate(calc(-50% + ${x}px), ${y}px)`;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced]);

  return (
    <div aria-hidden className="ambient-bg fixed inset-0 -z-10 overflow-hidden">
      <div className="ambient-glow ambient-glow-a" />
      <div className="ambient-glow ambient-glow-b" />
      {!reduced && (
        <div
          ref={glowRef}
          className="absolute top-[30%] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, var(--glow-a) 0%, transparent 65%)",
            filter: "blur(60px)",
            transition: "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      )}
    </div>
  );
}
