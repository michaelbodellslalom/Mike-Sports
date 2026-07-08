import type { Game, TicketOption } from "@/types/domain";

export function buildTicketOptions(games: Game[], zipCode: string): TicketOption[] {
  return games.map((game) => {
    const query = encodeURIComponent(`${game.awayTeam} at ${game.homeTeam}`);
    return {
      gameId: game.id,
      provider: "Ticketmaster",
      url: `https://www.ticketmaster.com/search?q=${query}&postalCode=${zipCode}`,
      city: zipCode,
    };
  });
}
