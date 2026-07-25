"use client";

import { useId } from "react";
import type { DiscordPresence } from "@/hooks/useDiscordPresence";
import { getStatusColor, getStatusLabel } from "@/hooks/useDiscordPresence";

type DiscordStatusIconProps = {
  status: DiscordPresence["status"];
  size?: number;
  className?: string;
};

export function DiscordStatusIcon({
  status,
  size = 14,
  className,
}: DiscordStatusIconProps) {
  const uid = useId().replace(/:/g, "");
  const maskOnline = `status-online-${uid}`;
  const maskIdle = `status-idle-${uid}`;
  const maskDnd = `status-dnd-${uid}`;
  const maskOffline = `status-offline-${uid}`;

  const masks: Record<DiscordPresence["status"], string> = {
    online: maskOnline,
    idle: maskIdle,
    dnd: maskDnd,
    offline: maskOffline,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className={className}
      aria-label={getStatusLabel(status)}
      role="img"
    >
      <defs>
        <mask id={maskOnline}>
          <rect width="16" height="16" fill="white" />
        </mask>
        <mask id={maskIdle}>
          <rect width="16" height="16" fill="white" />
          <circle cx="4.5" cy="3.5" r="6.5" fill="black" />
        </mask>
        <mask id={maskDnd}>
          <rect width="16" height="16" fill="white" />
          <rect x="3.2" y="5.5" width="9.6" height="5" rx="2.5" fill="black" />
        </mask>
        <mask id={maskOffline}>
          <rect width="16" height="16" fill="white" />
          <circle cx="8" cy="8" r="4.5" fill="black" />
        </mask>
      </defs>
      <circle
        cx="8"
        cy="8"
        r="8"
        fill={getStatusColor(status)}
        mask={`url(#${masks[status]})`}
      />
    </svg>
  );
}
