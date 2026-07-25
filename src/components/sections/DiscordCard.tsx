"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { useDiscordPresence, getStatusLabel } from "@/hooks/useDiscordPresence";
import { DiscordStatusIcon } from "@/components/ui/DiscordStatusIcon";

export function DiscordCard() {
  const presence = useDiscordPresence();

  if (!presence) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="panel h-full p-6 md:p-7"
      >
        <p className="text-sm text-[var(--faint)]">Conectando…</p>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="panel h-full p-6 md:p-7"
      aria-label="Discord"
    >
      <div className="mb-6 flex items-center justify-between">
        <p className="section-label">Discord</p>
        <BrandIcon brand="discord" size={18} />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12 shrink-0">
          <Image
            src={presence.avatarUrl}
            alt={presence.displayName}
            fill
            unoptimized
            className="rounded-full object-cover"
            sizes="48px"
          />
          <span className="absolute right-0 bottom-0 flex items-center justify-center ring-[2.5px] ring-[var(--bg)]">
            <DiscordStatusIcon status={presence.status} size={14} />
          </span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium text-[var(--fg)]">
            {presence.displayName}
          </p>
          <p className="truncate text-[13px] text-[var(--muted)]">@{presence.username}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[12px] text-[var(--faint)]">Status</span>
          <span className="text-[13px] text-[var(--muted)]">
            {getStatusLabel(presence.status)}
          </span>
        </div>
        {presence.primaryGuild && (
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[12px] text-[var(--faint)]">Tag</span>
            <span className="text-[13px] text-[var(--muted)]">{presence.primaryGuild.tag}</span>
          </div>
        )}
        {presence.activity && (
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[12px] text-[var(--faint)]">Atividade</span>
            <span className="truncate text-[13px] text-[var(--muted)]">
              {presence.activity}
            </span>
          </div>
        )}
        {presence.customStatus && (
          <p className="pt-1 text-[13px] leading-relaxed text-[var(--muted)]">
            {presence.customStatus}
          </p>
        )}
      </div>
    </motion.article>
  );
}
