"use client";

import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import { gsap, registerGsap } from "@/lib/gsap";

registerGsap();
gsap.registerPlugin(useGSAP);
import { getSiteConfig } from "@/lib/config";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type PreloaderProps = {
  onComplete: () => void;
};

export function Preloader({ onComplete }: PreloaderProps) {
  const { meta, features } = getSiteConfig();
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(features.preloader);
  const containerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!features.preloader || reduced) {
        onComplete();
        setVisible(false);
        return;
      }

      const name = meta.title;
      if (nameRef.current) {
        nameRef.current.innerHTML = name
          .split("")
          .map((char) => `<span class="inline-block opacity-0">${char}</span>`)
          .join("");
      }

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
              setVisible(false);
              onComplete();
            },
          });
        },
      });

      tl.to(progressBarRef.current, {
        scaleX: 1,
        duration: 1.8,
        ease: "power2.inOut",
      })
        .to(
          nameRef.current?.querySelectorAll("span") ?? [],
          {
            opacity: 1,
            y: 0,
            stagger: 0.06,
            duration: 0.5,
            ease: "power3.out",
          },
          "-=1.2",
        )
        .to(progressRef.current, { opacity: 0, duration: 0.3 }, "-=0.2")
        .to({}, { duration: 0.4 });
    },
    { scope: containerRef },
  );

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-[var(--bg)]/95 backdrop-blur-xl"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-8 px-6 text-center">
        <h1
          ref={nameRef}
          className="font-serif text-[clamp(2.5rem,8vw,4.5rem)] font-normal tracking-[0.04em] text-[var(--fg)]"
        >
          {meta.title}
        </h1>
        <div ref={progressRef} className="w-40">
          <div className="h-px w-full overflow-hidden bg-[var(--progress)]">
            <div
              ref={progressBarRef}
              className="h-full w-full origin-left scale-x-0 bg-[var(--fg)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
