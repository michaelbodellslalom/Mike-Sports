import Link from "next/link";
import { notFound } from "next/navigation";

import { fallbackNewsByLeague } from "@/data/fallbackContent";
import type { LeagueCode, NewsItem } from "@/types/domain";

const leagueLabels: Record<LeagueCode, string> = {
  NFL: "football",
  NBA: "basketball",
  MLB: "baseball",
  NHL: "hockey",
  NCAAF: "college football",
  NCAAB: "college basketball",
  PGA: "golf",
  UFC: "combat sports",
};

function getPlaceholderArticle(slug: string): NewsItem | undefined {
  return Object.values(fallbackNewsByLeague)
    .flat()
    .find((article) => article.url === `/news/${slug}`);
}

export default async function PlaceholderArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getPlaceholderArticle(slug);

  if (!article) {
    notFound();
  }

  const topic = article.relatedLeague ? leagueLabels[article.relatedLeague] : "sports";
  const subject = article.relatedTeam ?? article.relatedLeague ?? "today’s featured teams";

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <Link
        href="/"
        className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand)] shadow-sm hover:bg-emerald-50"
      >
        ← Back to Mike Sports
      </Link>

      <article className="mt-6 overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-lg">
        <div className="bg-slate-950 px-6 py-8 text-white sm:px-10 sm:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            {article.relatedLeague ?? "Sports"} preview article
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{article.title}</h1>
          <p className="mt-4 text-sm text-slate-300">
            {article.source} • Placeholder editorial preview
          </p>
        </div>

        <div className="space-y-5 px-6 py-8 text-base leading-8 text-slate-700 sm:px-10 sm:py-10">
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            <strong>Demo content:</strong> This placeholder article demonstrates the reading experience while live publisher content is unavailable.
          </p>
          <p>
            The latest conversation around {subject} centers on the details that can shape the next {topic} matchup. Recent form, lineup choices, and situational execution all provide useful context for fans deciding what to follow.
          </p>
          <p>
            One key storyline is how the team or competitors respond when the pace changes. Strong starts matter, but adjustments later in the event often separate a promising performance from a complete one. That makes coaching decisions, depth, and execution worth watching closely.
          </p>
          <h2 className="pt-2 text-xl font-bold text-slate-950">What to watch next</h2>
          <p>
            Watch for early tactical choices, the performance of high-priority players, and how effectively each side handles pressure moments. Those signals should offer a clearer picture of what comes next for {subject} and why this story is relevant to your personalized sports feed.
          </p>
        </div>
      </article>
    </main>
  );
}
