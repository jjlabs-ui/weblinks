"use client";

import { useEffect, useState } from "react";
import { getSiteConfig } from "@/lib/config";

export type DiscordPresence = {
  status: "online" | "idle" | "dnd" | "offline";
  displayName: string;
  username: string;
  avatarUrl: string;
  customStatus?: string;
  activity?: string;
  listeningToSpotify?: boolean;
  spotify?: {
    song: string;
    artist: string;
    album: string;
    albumArtUrl: string;
    timestamps?: { start: number; end: number };
  };
  primaryGuild?: {
    tag: string;
    guildId: string;
  };
};

const STATUS_COLORS = {
  online: "#23a559",
  idle: "#f0b232",
  dnd: "#f23f43",
  offline: "#80848e",
};

export function getStatusColor(status: DiscordPresence["status"]) {
  return STATUS_COLORS[status] ?? STATUS_COLORS.offline;
}

const STATUS_LABELS: Record<DiscordPresence["status"], string> = {
  online: "Online",
  idle: "Ausente",
  dnd: "Não perturbe",
  offline: "Offline",
};

export function getStatusLabel(status: DiscordPresence["status"]) {
  return STATUS_LABELS[status] ?? STATUS_LABELS.offline;
}

function parsePresence(data: Record<string, unknown>): DiscordPresence | null {
  const user = data.discord_user as Record<string, unknown> | undefined;
  if (!user) return null;

  const discordId = getSiteConfig().profile.discordId;
  const avatar = user.avatar as string | undefined;
  const ext = avatar?.startsWith("a_") ? "gif" : "png";
  const avatarUrl = avatar
    ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.${ext}?size=256`
    : getSiteConfig().profile.fallbackAvatar;

  let customStatus: string | undefined;
  let activity: string | undefined;
  const activities = data.activities as Array<Record<string, unknown>> | undefined;

  if (activities) {
    for (const act of activities) {
      if (act.type === 4 && act.state) {
        customStatus = String(act.state);
      } else if (act.type === 0 && act.name) {
        activity = String(act.name);
      }
    }
  }

  const pg = user.primary_guild as Record<string, unknown> | undefined;
  const spotify = data.spotify as Record<string, unknown> | undefined;

  return {
    status: (data.discord_status as DiscordPresence["status"]) || "offline",
    displayName:
      String(user.display_name || user.global_name || user.username || "jjxvnz"),
    username: String(user.username || "jjxvnz"),
    avatarUrl,
    customStatus,
    activity,
    listeningToSpotify: Boolean(data.listening_to_spotify),
    spotify: spotify
      ? {
          song: String(spotify.song || ""),
          artist: String(spotify.artist || ""),
          album: String(spotify.album || ""),
          albumArtUrl: String(spotify.album_art_url || ""),
          timestamps: spotify.timestamps as { start: number; end: number } | undefined,
        }
      : undefined,
    primaryGuild: pg?.tag
      ? {
          tag: String(pg.tag),
          guildId: String(pg.identity_guild_id || ""),
        }
      : undefined,
  };
}

export function useDiscordPresence() {
  const { profile } = getSiteConfig();
  const [presence, setPresence] = useState<DiscordPresence | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;
    let alive = true;

    const connect = () => {
      ws = new WebSocket("wss://api.lanyard.rest/socket");

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.op === 1) {
          ws?.send(
            JSON.stringify({
              op: 2,
              d: { subscribe_to_id: profile.discordId },
            }),
          );
          heartbeat = setInterval(() => {
            ws?.send(JSON.stringify({ op: 3 }));
          }, msg.d.heartbeat_interval);
        }
        if (msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE") {
          if (alive) setPresence(parsePresence(msg.d));
        }
      };

      ws.onclose = () => {
        if (heartbeat) clearInterval(heartbeat);
        if (alive) setTimeout(connect, 5000);
      };
    };

    fetch(`https://api.lanyard.rest/v1/users/${profile.discordId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && alive) setPresence(parsePresence(res.data));
      })
      .catch(() => {});

    connect();

    return () => {
      alive = false;
      if (heartbeat) clearInterval(heartbeat);
      ws?.close();
    };
  }, [profile.discordId]);

  return presence;
}
