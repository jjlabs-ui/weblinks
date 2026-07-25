"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { getSiteConfig } from "@/lib/config";
import { useDiscordPresence, getStatusLabel } from "@/hooks/useDiscordPresence";
import { DiscordStatusIcon } from "@/components/ui/DiscordStatusIcon";
import { useLocalTime } from "@/hooks/useLocalTime";
import { useWeather } from "@/hooks/useWeather";
import { useViews } from "@/hooks/useViews";
import { formatNumber } from "@/lib/utils";
import { Clock, Eye, Cloud } from "lucide-react";

export function HeroSection() {
  const { profile, weather, features } = getSiteConfig();
  const presence = useDiscordPresence();
  const localTime = useLocalTime();
  const weatherData = useWeather(weather.lat, weather.lon, features.weatherWidget);
  const views = useViews(features.viewsCounter);
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-hero-item]", {
        y: 24,
        opacity: 0,
        stagger: 0.06,
        duration: 0.75,
        ease: "power3.out",
        delay: 0.1,
      });
    },
    { scope: sectionRef },
  );

  const displayName = presence?.displayName ?? profile.name;
  const avatarUrl = presence?.avatarUrl ?? profile.fallbackAvatar;
  const status = presence?.status ?? "offline";

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[88vh] flex-col justify-center px-6 py-20 md:px-12 lg:px-20"
      aria-labelledby="hero-title"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-12 flex flex-wrap items-center gap-x-6 gap-y-2 section-label">
          <span data-hero-item className="inline-flex items-center gap-2">
            <Clock size={12} strokeWidth={1.5} />
            {localTime}
          </span>
          {weatherData && (
            <span data-hero-item className="inline-flex items-center gap-2">
              <Cloud size={12} strokeWidth={1.5} />
              {weatherData.temp}° · {weatherData.description}
            </span>
          )}
          {views !== null && (
            <span data-hero-item className="inline-flex items-center gap-2">
              <Eye size={12} strokeWidth={1.5} />
              {formatNumber(views)} visitas
            </span>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-end">
          <div data-hero-item className="relative h-24 w-24 md:h-32 md:w-32">
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              priority
              unoptimized={avatarUrl.includes("discordapp")}
              className="rounded-full object-cover"
              sizes="128px"
            />
            <span className="absolute right-0 bottom-0 flex items-center justify-center ring-[2.5px] ring-[var(--bg)] ring-offset-0">
              <DiscordStatusIcon status={status} size={16} />
            </span>
          </div>

          <div>
            <p
              data-hero-item
              className="section-label mb-3"
            >
              {profile.username}
            </p>
            <h1
              id="hero-title"
              data-hero-item
              className="font-serif text-[clamp(2.75rem,9vw,5.5rem)] leading-[0.95] font-normal tracking-[-0.03em] text-[var(--fg)]"
            >
              {displayName}
            </h1>
            <p
              data-hero-item
              className="mt-3 text-base tracking-[-0.01em] text-[var(--muted)] md:text-lg"
            >
              {profile.role}
            </p>
          </div>
        </div>

        <div className="mt-12 max-w-2xl">
          <p
            data-hero-item
            className="text-base leading-relaxed text-[var(--muted)] md:text-[17px]"
          >
            {profile.bio}
          </p>

          <div
            data-hero-item
            className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[var(--muted)]"
          >
            <span className="inline-flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor:
                    profile.availability === "available" ? "#23a559" : "#80848e",
                }}
              />
              {profile.availabilityLabel}
            </span>
            {presence && (
              <span>{getStatusLabel(presence.status)} no Discord</span>
            )}
            {presence?.spotify && (
              <span>
                {presence.spotify.song} — {presence.spotify.artist}
              </span>
            )}
            {presence?.customStatus && <span>{presence.customStatus}</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
