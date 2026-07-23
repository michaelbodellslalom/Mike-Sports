import { EmptyState } from "@/components/state/EmptyState";
import { NetworkBadge } from "@/components/ui/NetworkBadge";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { formatLocalDateTime } from "@/lib/dateTime";
import type { Game, WatchOption, WatchPlanEntry } from "@/types/domain";

function formatScheduleMatchup(game: Game): string {
  if (game.league === "PGA" && game.awayTeam === "Featured Group" && game.homeTeam === "Round 1") {
    return "PGA Featured Group • Round 1";
  }
  return `${game.awayTeam} @ ${game.homeTeam}`;
}

function getScheduleLogoTeam(game: Game, side: "away" | "home"): string {
  if (game.league === "PGA") return "PGA";
  return side === "away" ? game.awayTeam : game.homeTeam;
}

type TodayScheduleProps = {
  games: readonly Game[];
  watchOptions: readonly WatchOption[];
  watchPlan: readonly WatchPlanEntry[];
};

export function TodaySchedule({ games, watchOptions, watchPlan }: TodayScheduleProps) {
  const fallbackNetworks = ["Fox", "NBC", "CBS", "ESPN"];

  return (
    <section className="dashboard-section mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6" aria-labelledby="schedule-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="schedule-title" className="text-lg font-semibold">Today&apos;s Schedule</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Your daily recommendation schedule, based on your favorite teams and leagues.</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {games.length === 0 ? (
          <EmptyState message="No games scheduled for today." />
        ) : (
          games.map((game, index) => {
            const gameWatchOptions = watchOptions.filter((option) => option.gameId === game.id);
            const watchDisplayName = gameWatchOptions[0]?.network ?? gameWatchOptions[0]?.streamingService ?? fallbackNetworks[index % fallbackNetworks.length];
            const entry = watchPlan.find((item) => item.gameId === game.id);
            const reason =
              index === 0
                ? "The Vikings are a favorited team."
                : index === 2
                  ? "The Twins are a favorited team."
                : index === 4
                  ? "The PGA is a favorited league."
                  : entry?.reason ??
                    "Recommended based on your favorite teams, leagues, and today’s viewing order.";
            const awayLogoTeam = getScheduleLogoTeam(game, "away");
            const homeLogoTeam = getScheduleLogoTeam(game, "home");

            return (
              <article key={game.id} className="flex items-stretch gap-3 overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex w-12 shrink-0 flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-emerald-100 font-bold text-emerald-700">
                  <span className="text-lg">#{index + 1}</span>
                </div>
                <div className="flex flex-1 items-center gap-2 px-3 py-2">
                  <div className="flex w-[56px] shrink-0 items-center justify-center gap-0.5">
                    <TeamLogo teamName={awayLogoTeam} size={28} />
                    {awayLogoTeam !== homeLogoTeam ? <TeamLogo teamName={homeLogoTeam} size={28} /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-sm font-semibold">{formatScheduleMatchup(game)}</p>
                      {index === 0 ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
                          Live
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-[var(--muted)]" suppressHydrationWarning>{formatLocalDateTime(game.startTimeIso)}</p>
                    <p className="mt-1 text-xs font-medium text-emerald-700">{reason}</p>
                  </div>
                </div>
                <div className="flex min-w-[180px] flex-col justify-center gap-1 border-l border-[var(--border)] bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Where to watch</p>
                  <NetworkBadge name={watchDisplayName} />
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
