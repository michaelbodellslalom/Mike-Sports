import { getJson } from "@/lib/api/http";
import { providerConfig } from "@/lib/api/providers";
import { normalizeNewsApiArticles } from "@/lib/api/normalize";
import { env } from "@/lib/env";
import type { LeagueCode, NewsItem } from "@/types/domain";

type NewsApiResponse = {
  status: string;
  totalResults: number;
  articles: Array<{
    title: string;
    url: string;
    publishedAt: string;
    source: { name: string };
  }>;
};

export async function fetchNewsByQuery(query: string, league?: LeagueCode): Promise<NewsItem[]> {
  if (!env.NEXT_PUBLIC_NEWSAPI_KEY) {
    return [];
  }

  const params = new URLSearchParams({
    q: query,
    sortBy: "publishedAt",
    pageSize: "20",
    apiKey: env.NEXT_PUBLIC_NEWSAPI_KEY,
    language: "en",
  });

  const url = `${providerConfig.news.baseUrl}/everything?${params.toString()}`;
  const data = await getJson<NewsApiResponse>(url, {
    retries: 2,
    timeoutMs: 9000,
    ttlMs: 180_000,
    cacheKey: `news:${query}:${league ?? "none"}`,
    fallbackData: { status: "ok", totalResults: 0, articles: [] },
  });

  return normalizeNewsApiArticles(data.articles ?? [], league);
}
