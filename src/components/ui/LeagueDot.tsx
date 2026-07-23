import type { LeagueCode } from "@/types/domain";

const leagueColors: Record<LeagueCode, string> = {
  NFL: "#4f3f9a",
  MLB: "#002d72",
  NHL: "#00517a",
  NBA: "#c9082a",
  NCAAF: "#862334",
  NCAAB: "#862334",
  PGA: "#1a7a40",
  UFC: "#cc0000",
};

export function LeagueDot({ league }: { league?: LeagueCode }) {
  const color = league ? leagueColors[league] : "#94a3b8";

  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {league?.slice(0, 3) ?? "—"}
    </div>
  );
}
