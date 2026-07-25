"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { BrandIcon, getBrandColor } from "@/components/ui/BrandIcon";
import type { SiteLink } from "@/lib/config";

type LinkCardProps = {
  link: SiteLink;
  index: number;
};

export function LinkCard({ link, index }: LinkCardProps) {
  const brandColor = getBrandColor(link.id);

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
      className="group flex items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-300 hover:bg-[var(--surface-hover)] md:px-5 md:py-5"
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] transition-all duration-300 group-hover:bg-[var(--surface-hover)]"
        style={
          {
            "--brand-color": brandColor,
          } as React.CSSProperties
        }
      >
        <BrandIcon brand={link.id} size={20} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-medium tracking-[-0.02em] text-[var(--fg)]">
          {link.name}
        </span>
        <span className="truncate text-[13px] text-[var(--muted)]">{link.description}</span>
      </span>

      <ArrowUpRight
        size={14}
        strokeWidth={1.5}
        className="shrink-0 text-[var(--faint)] opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
      />
    </motion.a>
  );
}
