"use client";

import { getSiteConfig } from "@/lib/config";
import { LinkCard } from "@/components/ui/LinkCard";

export function LinksSection() {
  const { links } = getSiteConfig();

  return (
    <section className="px-6 py-24 md:px-12 lg:px-20" aria-labelledby="links-title">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <p className="section-label mb-3">Links</p>
          <h2 id="links-title" className="section-title">
            Onde me encontrar
          </h2>
        </div>

        <div className="flex flex-col gap-1">
          {links.map((link, index) => (
            <LinkCard key={link.id} link={link} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
