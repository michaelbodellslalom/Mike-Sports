import { ErrorState } from "@/components/state/ErrorState";
import { LoadingState } from "@/components/state/LoadingState";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { providerConfig } from "@/lib/api/providers";
import { formatLocalDateTime } from "@/lib/dateTime";
import type { Game } from "@/types/domain";

type ScoresSectionProps = {
  games: readonly Game[];
  isLoading: boolean;
  error: string | null;
};

export function ScoresSection({ games, isLoading, error }: ScoresSectionProps) {
  const displayedGames = [...games]
    .filter((game) => game.awayTeam && game.homeTeam)
    .sort((a, b) => {
      const statusOrder = { live: 0, final: 1, scheduled: 2 };
      const statusDifference = statusOrder[a.status] - statusOrder[b.status];
      return statusDifference || new Date(a.startTimeIso).getTime() - new Date(b.startTimeIso).getTime();
    })
    .slice(0, 8);

  return (
    <section className="dashboard-section mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6" aria-labelledby="scores-title" aria-busy={isLoading}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="scores-title" className="text-lg font-semibold">Scores</h2>
        <span className="text-xs text-[var(--muted)]">Source: {providerConfig.sports.provider}</span>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">Live, final, and next-up matchups based on your favorites.</p>
      <div className="mt-3 space-y-2">
        {isLoading ? <LoadingState label="Loading latest games..." /> : null}
        {error ? <ErrorState message={error} /> : null}
        {!isLoading && !error
          ? displayedGames.map((game) => {
              const headerClass = game.status === "live" ? "bg-red-600 text-white" : game.status === "final" ? "bg-slate-700 text-white" : "bg-blue-700 text-white";
              const status = game.status === "live" ? "● LIVE" : game.status === "scheduled" ? "UPCOMING" : "FINAL";
              const liveDetail = [game.periodLabel ?? "Quarter in progress", game.clock].filter(Boolean).join(" • ");

              return (
                <article key={game.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="flex shrink-0 items-center gap-0.5">
                      <TeamLogo teamName={game.awayTeam} size={28} />
                      <TeamLogo teamName={game.homeTeam} size={28} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{game.awayTeam} at {game.homeTeam}</p>
                      <p className="mt-0.5 text-xs uppercase tracking-wide text-[var(--muted)]" suppressHydrationWarning>
                        {formatLocalDateTime(game.startTimeIso)}{game.venue ? ` • ${game.venue}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="min-w-[150px] shrink-0 overflow-hidden rounded-md border border-slate-700 bg-slate-900 text-white shadow-sm">
                    <div className={`flex items-center justify-between gap-2 px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${headerClass}`}>
                      <span>{status}</span>
                      {game.status === "live" ? <span className="normal-case tracking-normal">{liveDetail}</span> : null}
                    </div>
                    <div className="flex items-center justify-between gap-3 border-b border-slate-700 px-2 py-1">
                      <span className="max-w-[72px] truncate text-[10px] font-semibold text-slate-300">{game.awayTeam.split(" ").at(-1)}</span>
                      <span className="text-base font-bold tabular-nums">{game.awayScore ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 px-2 py-1">
                      <span className="max-w-[72px] truncate text-[10px] font-semibold text-slate-300">{game.homeTeam.split(" ").at(-1)}</span>
                      <span className="text-base font-bold tabular-nums">{game.homeScore ?? 0}</span>
                    </div>
                  </div>
                </article>
              );
            })
          : null}
      </div>
    </section>
  );
}
