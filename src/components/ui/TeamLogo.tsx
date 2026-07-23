"use client";

import Image from "next/image";
import { useState } from "react";

import { getTeamLogo } from "@/lib/teamLogos";

const sportBadges: Record<string, { text: string; bg: string; fg: string }> = {
  PGA: { text: "PGA", bg: "#1a7a40", fg: "#fff" },
  "PGA Tour": { text: "PGA", bg: "#1a7a40", fg: "#fff" },
  "Featured Group": { text: "PGA", bg: "#1a7a40", fg: "#fff" },
  "Round 1": { text: "PGA", bg: "#1a7a40", fg: "#fff" },
  UFC: { text: "UFC", bg: "#cc0000", fg: "#fff" },
  "Main Card": { text: "UFC", bg: "#cc0000", fg: "#fff" },
  "Title Fight": { text: "UFC", bg: "#cc0000", fg: "#fff" },
  NFL: { text: "NFL", bg: "#003087", fg: "#fff" },
  NBA: { text: "NBA", bg: "#1d428a", fg: "#fff" },
  MLB: { text: "MLB", bg: "#12144d", fg: "#fff" },
  NHL: { text: "NHL", bg: "#111111", fg: "#fff" },
  MLS: { text: "MLS", bg: "#1a5c3a", fg: "#fff" },
  WNBA: { text: "WNB", bg: "#c4122e", fg: "#fff" },
  NCAAF: { text: "CFB", bg: "#8b0000", fg: "#fff" },
  NCAAB: { text: "CBK", bg: "#1a1a1a", fg: "#fff" },
};

type TeamLogoProps = {
  teamName: string | null | undefined;
  size?: number;
};

export function TeamLogo({ teamName, size = 28 }: TeamLogoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = getTeamLogo(teamName);
  const badge = teamName ? sportBadges[teamName] : undefined;

  if (!teamName) return null;

  const initials = teamName
    .split(" ")
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (src && failedSrc !== src) {
    return (
      <Image
        src={src}
        alt={teamName}
        width={size}
        height={size}
        className="shrink-0 object-contain drop-shadow-sm"
        aria-hidden="true"
        unoptimized
        onError={() => setFailedSrc(src)}
      />
    );
  }

  if (badge) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/40 text-[10px] font-black tracking-tight shadow-sm"
        style={{ backgroundColor: badge.bg, color: badge.fg, width: size, height: size }}
        aria-hidden="true"
      >
        {badge.text}
      </span>
    );
  }

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-gradient-to-br from-slate-100 to-slate-200 text-[10px] font-bold text-slate-700 shadow-sm"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
