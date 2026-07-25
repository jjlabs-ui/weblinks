"use client";

import { motion } from "framer-motion";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { getSiteConfig } from "@/lib/config";
import { useGitHubStats } from "@/hooks/useGitHubStats";
import { formatNumber } from "@/lib/utils";

export function GitHubCard() {
  const { profile } = getSiteConfig();
  const stats = useGitHubStats(profile.githubUsername);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="panel h-full p-6 md:p-7"
      aria-label="GitHub"
    >
      <div className="mb-6 flex items-center justify-between">
        <p className="section-label">GitHub</p>
        <BrandIcon brand="github" size={18} />
      </div>

      {stats ? (
        <>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-serif text-3xl tracking-[-0.02em] text-[var(--fg)]">
                {formatNumber(stats.repos)}
              </p>
              <p className="mt-1.5 text-[12px] text-[var(--faint)]">Repositórios</p>
            </div>
            <div>
              <p className="font-serif text-3xl tracking-[-0.02em] text-[var(--fg)]">
                {formatNumber(stats.followers)}
              </p>
              <p className="mt-1.5 text-[12px] text-[var(--faint)]">Followers</p>
            </div>
          </div>

          {stats.languages.length > 0 && (
            <p className="mt-6 text-[13px] leading-relaxed text-[var(--muted)]">
              {stats.languages.join(" · ")}
            </p>
          )}

          {stats.lastRepo && (
            <a
              href={stats.lastRepo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block transition-opacity duration-200 hover:opacity-60"
            >
              <p className="section-label mb-2">Último repo</p>
              <p className="text-[15px] font-medium text-[var(--fg)]">{stats.lastRepo.name}</p>
              {stats.lastRepo.description && (
                <p className="mt-1 text-[13px] text-[var(--muted)]">
                  {stats.lastRepo.description}
                </p>
              )}
            </a>
          )}
        </>
      ) : (
        <p className="text-sm text-[var(--faint)]">Carregando…</p>
      )}
    </motion.article>
  );
}
