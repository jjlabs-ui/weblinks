"use client";

import { useEffect, useState } from "react";

export type GitHubStats = {
  repos: number;
  followers: number;
  languages: string[];
  lastRepo?: {
    name: string;
    description: string;
    url: string;
    language?: string;
  };
};

export function useGitHubStats(username: string) {
  const [stats, setStats] = useState<GitHubStats | null>(null);

  useEffect(() => {
    fetch(`/api/github?username=${encodeURIComponent(username)}`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, [username]);

  return stats;
}
