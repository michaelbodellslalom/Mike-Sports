import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_THESPORTSDB_BASE_URL: z.string().url().default("https://www.thesportsdb.com/api/v1/json/3"),
  NEXT_PUBLIC_THESPORTSDB_API_KEY: z.string().optional(),
  NEXT_PUBLIC_NEWSAPI_BASE_URL: z.string().url().default("https://newsapi.org/v2"),
  NEXT_PUBLIC_NEWSAPI_KEY: z.string().optional(),
  NEXT_PUBLIC_WATCHMODE_BASE_URL: z.string().url().default("https://api.watchmode.com/v1"),
  NEXT_PUBLIC_WATCHMODE_API_KEY: z.string().optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_THESPORTSDB_BASE_URL: process.env.NEXT_PUBLIC_THESPORTSDB_BASE_URL,
  NEXT_PUBLIC_THESPORTSDB_API_KEY: process.env.NEXT_PUBLIC_THESPORTSDB_API_KEY,
  NEXT_PUBLIC_NEWSAPI_BASE_URL: process.env.NEXT_PUBLIC_NEWSAPI_BASE_URL,
  NEXT_PUBLIC_NEWSAPI_KEY: process.env.NEXT_PUBLIC_NEWSAPI_KEY,
  NEXT_PUBLIC_WATCHMODE_BASE_URL: process.env.NEXT_PUBLIC_WATCHMODE_BASE_URL,
  NEXT_PUBLIC_WATCHMODE_API_KEY: process.env.NEXT_PUBLIC_WATCHMODE_API_KEY,
});
