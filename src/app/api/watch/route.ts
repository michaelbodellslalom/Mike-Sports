import { NextResponse } from "next/server";

import { fetchWatchOptionsByTitle } from "@/lib/api/watchClient";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Minnesota Vikings";
  const gameId = searchParams.get("gameId") ?? "demo-game";

  try {
    const options = await fetchWatchOptionsByTitle(gameId, title);
    return NextResponse.json({ title, options });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown watch API error" },
      { status: 500 },
    );
  }
}
