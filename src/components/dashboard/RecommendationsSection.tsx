import { EmptyState } from "@/components/state/EmptyState";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { formatLocalDateTime } from "@/lib/dateTime";
import type { Game, Recommendation } from "@/types/domain";

export type RecommendationGame = {
  recommendation: Recommendation;
  game: Game;
};

export function RecommendationsSection({ items }: { items: readonly RecommendationGame[] }) {
  return (
    <section className="dashboard-section mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6" aria-labelledby="recommendations-title">
      <h2 id="recommendations-title" className="text-lg font-semibold">Additional games you might be interested in</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">Scores are based on proximity to your favorites.</p>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {items.length === 0 ? (
          <EmptyState message="No recommendation candidates yet. As more games load, suggestions will appear here." />
        ) : (
          items.map(({ recommendation, game }) => (
            <article key={recommendation.gameId} className="rounded-lg border border-[var(--border)] bg-white p-3">
              <div className="flex items-center gap-2">
                <TeamLogo teamName={game.awayTeam} size={28} />
                <span className="text-xs text-slate-400">@</span>
                <TeamLogo teamName={game.homeTeam} size={28} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{game.awayTeam} at {game.homeTeam}</p>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      Score {Math.max(0, Math.round(recommendation.score))}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]" suppressHydrationWarning>{formatLocalDateTime(game.startTimeIso)} • {game.league}</p>
              <p className="mt-2 text-sm text-[var(--text)]">{recommendation.reason}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
