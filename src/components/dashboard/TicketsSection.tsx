import { EmptyState } from "@/components/state/EmptyState";
import { formatLocalDateTime } from "@/lib/dateTime";
import { ensureColoradoMatchup, getDenverVenueForLeague } from "@/lib/tickets";
import type { Game, TicketOption } from "@/types/domain";

const providerColors: Record<string, string> = {
  ticketmaster: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  stubhub: "bg-orange-50 border-orange-200 hover:bg-orange-100",
  "stub hub": "bg-orange-50 border-orange-200 hover:bg-orange-100",
  gametime: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
  vividseats: "bg-purple-50 border-purple-200 hover:bg-purple-100",
};

const providerBadgeColors: Record<string, string> = {
  ticketmaster: "bg-blue-500 text-white",
  stubhub: "bg-orange-500 text-white",
  "stub hub": "bg-orange-500 text-white",
  gametime: "bg-emerald-600 text-white",
  vividseats: "bg-purple-500 text-white",
};

type TicketsSectionProps = {
  zipCode: string;
  ticketOptions: readonly TicketOption[];
  scheduleGames: readonly Game[];
};

export function TicketsSection({ zipCode, ticketOptions, scheduleGames }: TicketsSectionProps) {
  return (
    <section className="dashboard-section mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6" aria-labelledby="tickets-title">
      <h2 id="tickets-title" className="text-lg font-semibold">Tickets near {zipCode}</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">Browse recommended tickets in your area.</p>
      <div className="mt-4 space-y-3">
        {ticketOptions.length === 0 ? (
          <EmptyState message="No ticket links available for the current schedule window." />
        ) : (
          ticketOptions.map((ticket) => {
            const game = scheduleGames.find((item) => item.id === ticket.gameId);
            const matchup = game ? ensureColoradoMatchup(game) : null;
            const venue = game ? getDenverVenueForLeague(game.league) : null;
            const providerKey = ticket.provider.toLowerCase();
            const colorClass = providerColors[providerKey] ?? "bg-slate-50 border-slate-200 hover:bg-slate-100";
            const badgeClass = providerBadgeColors[providerKey] ?? "bg-slate-400 text-white";

            return (
              <a key={`${ticket.gameId}-${ticket.provider}`} href={ticket.url} target="_blank" rel="noreferrer" className={`group block rounded-lg border border-[var(--border)] transition ${colorClass}`}>
                <div className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{matchup ? `${matchup.awayTeam} at ${matchup.homeTeam}` : "Open matchup tickets"}</p>
                    {game ? (
                      <p className="mt-1 text-xs uppercase tracking-wide text-[var(--muted)]" suppressHydrationWarning>
                        {formatLocalDateTime(game.startTimeIso)}{venue ? ` • ${venue}` : ""}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-[var(--muted)]">Get tickets for ZIP {zipCode}</p>
                  </div>
                  <span className={`${badgeClass} flex shrink-0 items-center rounded px-2.5 py-1 text-xs font-semibold`}>{ticket.provider}</span>
                </div>
              </a>
            );
          })
        )}
      </div>
      {ticketOptions.length > 0 ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs text-emerald-900">💡 <strong>Pro tip:</strong> Compare prices across providers to find the best deal for your game</p>
        </div>
      ) : null}
    </section>
  );
}
