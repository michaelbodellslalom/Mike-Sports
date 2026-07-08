import { getJson } from "@/lib/api/http";
import { providerConfig } from "@/lib/api/providers";
import { env } from "@/lib/env";
import type { WatchOption } from "@/types/domain";

type WatchmodeSearchResponse = {
  title_results?: Array<{ id: number; name: string }>;
};

type WatchmodeSourceResponse = Array<{
  name: string;
  type: string;
}>;

export async function fetchWatchOptionsByTitle(gameId: string, title: string): Promise<WatchOption[]> {
  if (!env.NEXT_PUBLIC_WATCHMODE_API_KEY) {
    return [];
  }

  const searchParams = new URLSearchParams({
    apiKey: env.NEXT_PUBLIC_WATCHMODE_API_KEY,
    search_field: "name",
    search_value: title,
  });

  const searchUrl = `${providerConfig.watch.baseUrl}/search/?${searchParams.toString()}`;
  const searchData = await getJson<WatchmodeSearchResponse>(searchUrl, {
    retries: 1,
    timeoutMs: 8000,
    ttlMs: 300_000,
    cacheKey: `watch:search:${title}`,
    fallbackData: { title_results: [] },
  });

  const bestMatch = searchData.title_results?.[0];
  if (!bestMatch) {
    return [];
  }

  const sourcesUrl = `${providerConfig.watch.baseUrl}/title/${bestMatch.id}/sources/?apiKey=${env.NEXT_PUBLIC_WATCHMODE_API_KEY}`;
  const sourceData = await getJson<WatchmodeSourceResponse>(sourcesUrl, {
    retries: 1,
    timeoutMs: 8000,
    ttlMs: 300_000,
    cacheKey: `watch:sources:${bestMatch.id}`,
    fallbackData: [],
  });

  return sourceData.map((source) => ({
    gameId,
    network: source.type === "tv" ? source.name : undefined,
    streamingService: source.type !== "tv" ? source.name : undefined,
    notes: `source type: ${source.type}`,
  }));
}
