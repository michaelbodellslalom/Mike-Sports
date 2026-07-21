export const providerConfig = {
  sports: {
    provider: "TheSportsDB",
    docs: "https://www.thesportsdb.com/api.php",
  },
  news: {
    provider: "NewsAPI",
    docs: "https://newsapi.org/docs",
  },
  watch: {
    provider: "Watchmode",
    docs: "https://api.watchmode.com/docs",
  },
} as const;
