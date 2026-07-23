"use client";

import { LoadingState } from "@/components/state/LoadingState";
import { LeagueDot } from "@/components/ui/LeagueDot";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { providerConfig } from "@/lib/api/providers";
import { formatLocalDateTime } from "@/lib/dateTime";
import type { NewsItem } from "@/types/domain";

type NewsSectionProps = {
  items: readonly NewsItem[];
  isLoading: boolean;
  error: string | null;
  page: number;
  onLoadMore: () => void;
};

export function NewsSection({ items, isLoading, error, page, onLoadMore }: NewsSectionProps) {
  const visibleItems = items.slice(0, page * 5);

  return (
    <section className="dashboard-section mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6" aria-labelledby="news-title" aria-busy={isLoading}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="news-title" className="text-lg font-semibold">News</h2>
        <span className="text-xs text-[var(--muted)]">Source: {providerConfig.news.provider}</span>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">Read the latest articles on topics relevant to your favorite teams and leagues.</p>
      <div className="mt-3 space-y-2">
        {isLoading ? <LoadingState label="Loading headlines..." /> : null}
        {error ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="status">
            Live news is unavailable, so preview articles are shown below.
          </p>
        ) : null}
        {!isLoading
          ? visibleItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target={item.url.startsWith("/") ? undefined : "_blank"}
                rel={item.url.startsWith("/") ? undefined : "noreferrer"}
                className="group flex items-stretch overflow-hidden rounded-lg border border-[var(--border)] bg-white text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                {item.imageUrl ? (
                  <div className="w-20 shrink-0 overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(event) => {
                        event.currentTarget.parentElement!.style.display = "none";
                      }}
                      aria-hidden="true"
                    />
                  </div>
                ) : (
                  <div className="flex w-20 shrink-0 items-center justify-center border-r border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50">
                    {item.relatedTeam ? <TeamLogo teamName={item.relatedTeam} size={38} /> : <LeagueDot league={item.relatedLeague} />}
                  </div>
                )}
                <div className="flex-1 px-3 py-2">
                  <p className="font-medium leading-snug transition group-hover:text-[var(--brand)]">{item.title}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]" suppressHydrationWarning>
                    {item.source} • {formatLocalDateTime(item.publishedAtIso)}
                  </p>
                </div>
              </a>
            ))
          : null}
      </div>
      {!isLoading && items.length > page * 5 ? (
        <button type="button" onClick={onLoadMore} className="mt-4 w-full rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand)] transition hover:bg-emerald-50">
          Load more articles ({items.length - page * 5} remaining)
        </button>
      ) : null}
    </section>
  );
}
