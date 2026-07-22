import type { Game, TicketOption } from "@/types/domain";

type TicketGameLike = Pick<Game, "league" | "awayTeam" | "homeTeam">;

const denverVenueByLeague: Record<Game["league"], string> = {
  NFL: "Empower Field at Mile High (Denver)",
  NBA: "Ball Arena (Denver)",
  MLB: "Coors Field (Denver)",
  NHL: "Ball Arena (Denver)",
  NCAAF: "Folsom Field (Boulder)",
  NCAAB: "CU Events Center (Boulder)",
  PGA: "Castle Pines Golf Club (Colorado)",
  UFC: "Ball Arena (Denver)",
};

const coloradoTeamByLeague: Record<Game["league"], string> = {
  NFL: "Denver Broncos",
  NBA: "Denver Nuggets",
  MLB: "Colorado Rockies",
  NHL: "Colorado Avalanche",
  NCAAF: "Colorado Buffaloes",
  NCAAB: "Colorado Buffaloes",
  PGA: "Colorado Featured Group",
  UFC: "Denver Main Card",
};

export function ensureColoradoMatchup(game: TicketGameLike): { awayTeam: string; homeTeam: string } {
  const hasColoradoTeam =
    game.awayTeam.toLowerCase().includes("colorado") ||
    game.awayTeam.toLowerCase().includes("denver") ||
    game.homeTeam.toLowerCase().includes("colorado") ||
    game.homeTeam.toLowerCase().includes("denver");

  if (hasColoradoTeam) {
    return {
      awayTeam: game.awayTeam,
      homeTeam: game.homeTeam,
    };
  }

  return {
    awayTeam: game.awayTeam,
    homeTeam: coloradoTeamByLeague[game.league],
  };
}

export function getDenverVenueForLeague(league: Game["league"]): string {
  return denverVenueByLeague[league];
}

export function buildTicketOptions(games: Game[], zipCode: string): TicketOption[] {
  const providerRotation = [
    {
      provider: "Ticketmaster",
      baseUrl: "https://www.ticketmaster.com/search",
    },
    {
      provider: "Gametime",
      baseUrl: "https://gametime.co/search",
    },
    {
      provider: "StubHub",
      baseUrl: "https://www.stubhub.com/find/s/?q",
    },
  ] as const;

  return games.map((game, index) => {
    const coloradoMatchup = ensureColoradoMatchup(game);
    const query = encodeURIComponent(`${coloradoMatchup.awayTeam} at ${coloradoMatchup.homeTeam}`);
    const providerConfig = providerRotation[index % providerRotation.length];
    return {
      gameId: game.id,
      provider: providerConfig.provider,
      url: `${providerConfig.baseUrl}?q=${query}&postalCode=${zipCode}`,
      city: zipCode,
    };
  });
}
