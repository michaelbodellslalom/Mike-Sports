import { NextResponse } from "next/server";

import { fetchLeagueGames } from "@/lib/api/sportsClient";
import type { LeagueCode } from "@/types/domain";

const allowedLeagues: LeagueCode[] = ["NFL", "NBA", "MLB", "NHL", "NCAAF", "NCAAB", "PGA", "UFC"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueParam = searchParams.get("league") as LeagueCode | null;
  const league = leagueParam && allowedLeagues.includes(leagueParam) ? leagueParam : "NFL";

  try {
    const games = await fetchLeagueGames(league);
    return NextResponse.json({ league, games });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown sports API error" },
      { status: 500 },
    );
  }
}
