import type { LeagueCode } from "@/types/domain";

export function inferLeagueFromFavorite(favorite: string): LeagueCode {
  const normalized = favorite.toLowerCase();

  if (normalized.includes("vikings")) return "NFL";
  if (normalized.includes("timberwolves")) return "NBA";
  if (normalized.includes("twins")) return "MLB";
  if (normalized.includes("wild")) return "NHL";
  if (normalized.includes("football")) return "NCAAF";
  if (normalized.includes("basketball")) return "NCAAB";
  if (normalized.includes("pga")) return "PGA";
  if (normalized.includes("ufc")) return "UFC";

  return "NFL";
}
