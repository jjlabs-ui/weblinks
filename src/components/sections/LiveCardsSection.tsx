"use client";

import dynamic from "next/dynamic";

const SpotifyCard = dynamic(
  () => import("./SpotifyCard").then((m) => m.SpotifyCard),
  { ssr: false },
);
const GitHubCard = dynamic(
  () => import("./GitHubCard").then((m) => m.GitHubCard),
  { ssr: false },
);
const DiscordCard = dynamic(
  () => import("./DiscordCard").then((m) => m.DiscordCard),
  { ssr: false },
);
const SteamCard = dynamic(
  () => import("./SteamCard").then((m) => m.SteamCard),
  { ssr: false },
);

export function LiveCardsSection() {
  return (
    <section className="px-6 py-20 md:px-12 lg:px-20" aria-labelledby="live-title">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-12">
          <p className="section-label mb-3">Ao vivo</p>
          <h2 id="live-title" className="section-title">
            Presença
          </h2>
        </div>

        <div className="flex flex-col gap-4 md:gap-5">
          <SpotifyCard />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            <GitHubCard />
            <DiscordCard />
            <SteamCard />
          </div>
        </div>
      </div>
    </section>
  );
}
