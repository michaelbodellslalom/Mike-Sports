import { env } from "@/lib/env";

export const providerConfig = {
  sports: {
    provider: "TheSportsDB",
    baseUrl: env.NEXT_PUBLIC_THESPORTSDB_BASE_URL,
    docs: "https://www.thesportsdb.com/api.php",
  },
  news: {
    provider: "NewsAPI",
    baseUrl: env.NEXT_PUBLIC_NEWSAPI_BASE_URL,
    docs: "https://newsapi.org/docs",
  },
  watch: {
    provider: "Watchmode",
    baseUrl: env.NEXT_PUBLIC_WATCHMODE_BASE_URL,
    docs: "https://api.watchmode.com/docs",
  },
} as const;
