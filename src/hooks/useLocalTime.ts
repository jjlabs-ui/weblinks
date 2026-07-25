"use client";

import { useEffect, useState } from "react";
import { getSiteConfig } from "@/lib/config";

export function useLocalTime() {
  const { profile } = getSiteConfig();
  const [time, setTime] = useState("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: profile.timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const tick = () => setTime(formatter.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [profile.timezone]);

  return time;
}
