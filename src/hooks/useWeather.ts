"use client";

import { useEffect, useState } from "react";

export type WeatherData = {
  temp: number;
  description: string;
  icon: string;
};

export function useWeather(lat: number, lon: number, enabled = true) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (!enabled) return;
    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      .then((r) => r.json())
      .then(setWeather)
      .catch(() => setWeather(null));
  }, [lat, lon, enabled]);

  return weather;
}
