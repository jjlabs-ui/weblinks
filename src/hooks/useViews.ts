"use client";

import { useEffect, useState } from "react";

type ViewsResponse = { count: number };

export function useViews(enabled = true) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    fetch("/api/views", { method: "POST" })
      .then((r) => r.json())
      .then((data: ViewsResponse) => setViews(data.count))
      .catch(() => setViews(null));
  }, [enabled]);

  return views;
}
