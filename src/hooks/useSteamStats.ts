"use client";

import { useEffect, useState } from "react";

export type SteamStats = {
  online: boolean;
  personaName: string;
  avatarUrl: string;
  lastGame?: string;
  location?: string;
  gameCount?: number;
};

export function useSteamStats(steamId: string) {
  const [stats, setStats] = useState<SteamStats | null>(null);

  useEffect(() => {
    fetch(`/api/steam?steamId=${encodeURIComponent(steamId)}`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, [steamId]);

  return stats;
}
