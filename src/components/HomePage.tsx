"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { getSiteConfig } from "@/lib/config";

const Preloader = dynamic(
  () => import("@/components/sections/Preloader").then((m) => m.Preloader),
  { ssr: false },
);
const InteractiveBackground = dynamic(
  () =>
    import("@/components/layout/InteractiveBackground").then(
      (m) => m.InteractiveBackground,
    ),
  { ssr: false },
);
const ScrollProgress = dynamic(
  () => import("@/components/layout/ScrollProgress").then((m) => m.ScrollProgress),
  { ssr: false },
);
const HeroSection = dynamic(
  () => import("@/components/sections/HeroSection").then((m) => m.HeroSection),
  { ssr: true },
);
const LinksSection = dynamic(
  () => import("@/components/sections/LinksSection").then((m) => m.LinksSection),
  { ssr: true },
);
const LiveCardsSection = dynamic(
  () =>
    import("@/components/sections/LiveCardsSection").then((m) => m.LiveCardsSection),
  { ssr: false },
);

export function HomePage() {
  const { meta, features } = getSiteConfig();
  const [ready, setReady] = useState(!features.preloader);
  const [easterCount, setEasterCount] = useState(0);

  const handleEaster = () => {
    if (!features.easterEggs) return;
    setEasterCount((c) => c + 1);
  };

  return (
    <>
      {features.preloader && !ready && <Preloader onComplete={() => setReady(true)} />}

      <InteractiveBackground />
      <ScrollProgress />

      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>

      <div
        className="relative transition-opacity duration-700"
        style={{ opacity: ready ? 1 : 0 }}
      >
        <main id="main-content">
          <HeroSection />
          <LiveCardsSection />
          <LinksSection />
        </main>

        <footer className="px-6 py-16 md:px-12 lg:px-20">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={handleEaster}
              className="text-left font-serif text-lg text-[var(--fg)] transition-opacity hover:opacity-60"
            >
              {meta.title}
            </button>
            <p className="text-xs tracking-[0.12em] text-[var(--faint)]">
              © {new Date().getFullYear()} {meta.title}. Todos os direitos reservados.
              {easterCount >= 5 && " · easter egg"}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
