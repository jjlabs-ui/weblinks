"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { ScrollTrigger } from "@/lib/gsap";
import { registerGsap } from "@/lib/gsap";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();
    const bar = barRef.current;
    if (!bar) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.2,
          },
        },
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      aria-hidden
      className="fixed top-0 right-0 left-0 z-[99990] h-px origin-left bg-[var(--progress)]"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left scale-x-0 bg-[var(--fg)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
