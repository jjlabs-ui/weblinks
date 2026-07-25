"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { useDiscordPresence } from "@/hooks/useDiscordPresence";
import { formatDuration } from "@/lib/utils";

export function SpotifyCard() {
  const presence = useDiscordPresence();
  const spotify = presence?.spotify;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!spotify?.timestamps) return;
    const { start, end } = spotify.timestamps;
    const tick = () => setProgress(((Date.now() - start) / (end - start)) * 100);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [spotify]);

  if (!spotify) return null;

  const elapsed = spotify.timestamps
    ? formatDuration(Date.now() - spotify.timestamps.start)
    : "0:00";
  const total = spotify.timestamps
    ? formatDuration(spotify.timestamps.end - spotify.timestamps.start)
    : "—";

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="panel w-full p-6 md:p-7"
      aria-label="Spotify"
    >
      <div className="mb-6 flex items-center justify-between">
        <p className="section-label">Spotify · tocando agora</p>
        <BrandIcon brand="spotify" size={18} />
      </div>

      <div className="flex gap-5">
        {spotify.albumArtUrl && (
          <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl">
            <Image
              src={spotify.albumArtUrl}
              alt={spotify.album}
              fill
              unoptimized
              className="object-cover"
              sizes="72px"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-medium tracking-[-0.01em] text-[var(--fg)]">
            {spotify.song}
          </p>
          <p className="mt-1 truncate text-[14px] text-[var(--muted)]">{spotify.artist}</p>
          <p className="mt-0.5 truncate text-[12px] text-[var(--faint)]">{spotify.album}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-[2px] overflow-hidden rounded-full bg-[var(--progress)]">
          <div
            className="h-full rounded-full bg-[var(--fg)] opacity-80 transition-all duration-1000"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <div className="mt-2.5 flex justify-between text-[11px] tabular-nums text-[var(--faint)]">
          <span>{elapsed}</span>
          <span>{total}</span>
        </div>
      </div>
    </motion.article>
  );
}
