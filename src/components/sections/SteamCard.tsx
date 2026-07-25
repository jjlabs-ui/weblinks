"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { getSiteConfig } from "@/lib/config";
import { useSteamStats } from "@/hooks/useSteamStats";

export function SteamCard() {
  const { profile } = getSiteConfig();
  const stats = useSteamStats(profile.steamId);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="panel h-full p-6 md:p-7"
      aria-label="Steam"
    >
      <div className="mb-6 flex items-center justify-between">
        <p className="section-label">Steam</p>
        <BrandIcon brand="steam" size={18} />
      </div>

      {stats ? (
        <>
          <div className="flex items-center gap-4">
            {stats.avatarUrl && (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={stats.avatarUrl}
                  alt={stats.personaName}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            )}
            <div>
              <p className="text-[15px] font-medium text-[var(--fg)]">{stats.personaName}</p>
              <p className="text-[13px] text-[var(--muted)]">
                {stats.online ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {stats.location && (
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[12px] text-[var(--faint)]">Local</span>
                <span className="text-[13px] text-[var(--muted)]">{stats.location}</span>
              </div>
            )}
            {stats.lastGame && (
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[12px] text-[var(--faint)]">Jogando</span>
                <span className="truncate text-[13px] text-[var(--muted)]">{stats.lastGame}</span>
              </div>
            )}
            {stats.gameCount !== undefined && stats.gameCount > 0 && (
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[12px] text-[var(--faint)]">Biblioteca</span>
                <span className="text-[13px] text-[var(--muted)]">{stats.gameCount} jogos</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-[var(--faint)]">Carregando…</p>
      )}
    </motion.article>
  );
}
