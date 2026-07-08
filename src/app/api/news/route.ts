import { NextResponse } from "next/server";

import { fetchNewsByQuery } from "@/lib/api/newsClient";
import type { LeagueCode } from "@/types/domain";

const allowedLeagues: LeagueCode[] = ["NFL", "NBA", "MLB", "NHL", "NCAAF", "NCAAB", "PGA", "UFC"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "sports";
  const leagueParam = searchParams.get("league") as LeagueCode | null;
  const league = leagueParam && allowedLeagues.includes(leagueParam) ? leagueParam : undefined;

  try {
    const items = await fetchNewsByQuery(query, league);
    return NextResponse.json({ query, league, items });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown news API error" },
      { status: 500 },
    );
  }
}
