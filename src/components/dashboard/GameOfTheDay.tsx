import { NetworkBadge } from "@/components/ui/NetworkBadge";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { formatLocalDateTime } from "@/lib/dateTime";
import type { Game, WatchOption } from "@/types/domain";

type GameOfTheDayProps = {
  game?: Game;
  reason: string | null;
  watchOptions: readonly WatchOption[];
};

export function GameOfTheDay({ game, reason, watchOptions }: GameOfTheDayProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-slate-950 p-5 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Game of the day</p>
      {game ? (
        <>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex shrink-0 flex-col items-center gap-1">
              <TeamLogo teamName={game.awayTeam} size={40} />
              <span className="text-[11px] font-bold text-slate-500">@</span>
              <TeamLogo teamName={game.homeTeam} size={40} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold leading-snug">{game.awayTeam}</h2>
              <p className="text-xs text-slate-500">at</p>
              <h2 className="text-base font-bold leading-snug">{game.homeTeam}</h2>
              {reason ? (
                <p className="mt-2 text-[11px] leading-4 text-slate-300">
                  <span className="font-semibold text-emerald-300">Recommended because</span>{" "}
                  {reason.replace(/^Because /, "").replace(/\.$/, "").toLowerCase()}.
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                game.status === "live"
                  ? "border border-red-400/40 bg-red-500/20 text-red-200"
                  : game.status === "final"
                    ? "bg-slate-600 text-slate-200"
                    : "bg-slate-700 text-slate-300"
              }`}>
                {game.status === "live" ? <span className="h-1.5 w-1.5 rounded-full bg-red-400" aria-hidden="true" /> : null}
                {game.status === "live" ? "Live" : game.status === "final" ? "Final" : "Upcoming"}
              </span>
              {game.status === "live" ? (
                <span className="rounded-md bg-amber-300/10 px-2 py-1 text-[11px] font-semibold text-amber-200">
                  {game.periodLabel ?? "Quarter in progress"}
                  {game.clock ? ` • ${game.clock} left` : ""}
                </span>
              ) : null}
            </div>
            {game.venue ? (
              <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-4 text-slate-400">
                <span aria-hidden="true">📍</span>
                <span>{game.venue}</span>
              </p>
            ) : null}

            {game.status === "live" || game.status === "final" ? (
              <div className="mt-2 flex items-center justify-around">
                <div className="text-center">
                  <p className="text-[11px] text-slate-400">{game.awayTeam.split(" ").at(-1)}</p>
                  <p className="text-3xl font-bold tabular-nums">{game.awayScore ?? 0}</p>
                </div>
                <span className="text-lg text-slate-600">—</span>
                <div className="text-center">
                  <p className="text-[11px] text-slate-400">{game.homeTeam.split(" ").at(-1)}</p>
                  <p className="text-3xl font-bold tabular-nums">{game.homeScore ?? 0}</p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm font-semibold text-slate-200" suppressHydrationWarning>
                {formatLocalDateTime(game.startTimeIso)}
              </p>
            )}
            {watchOptions.length > 0 ? (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500">Watch on</span>
                {watchOptions.map((option, index) => (
                  <NetworkBadge key={index} name={option.network ?? option.streamingService ?? "Unknown"} />
                ))}
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <h2 className="mt-3 text-2xl font-bold">Tonight&apos;s slate loading</h2>
          <p className="mt-2 text-sm text-slate-300">Scores and schedules will populate here.</p>
        </>
      )}
    </div>
  );
}
