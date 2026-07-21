import { z } from "zod";

const envSchema = z.object({
  THESPORTSDB_BASE_URL: z.string().url().default("https://www.thesportsdb.com/api/v1/json/3"),
  THESPORTSDB_API_KEY: z.string().optional(),
  NEWSAPI_BASE_URL: z.string().url().default("https://newsapi.org/v2"),
  NEWSAPI_KEY: z.string().optional(),
  WATCHMODE_BASE_URL: z.string().url().default("https://api.watchmode.com/v1"),
  WATCHMODE_API_KEY: z.string().optional(),
});

export const env = envSchema.parse({
  THESPORTSDB_BASE_URL: process.env.THESPORTSDB_BASE_URL ?? process.env.NEXT_PUBLIC_THESPORTSDB_BASE_URL,
  THESPORTSDB_API_KEY: process.env.THESPORTSDB_API_KEY ?? process.env.NEXT_PUBLIC_THESPORTSDB_API_KEY,
  NEWSAPI_BASE_URL: process.env.NEWSAPI_BASE_URL ?? process.env.NEXT_PUBLIC_NEWSAPI_BASE_URL,
  NEWSAPI_KEY: process.env.NEWSAPI_KEY ?? process.env.NEXT_PUBLIC_NEWSAPI_KEY,
  WATCHMODE_BASE_URL: process.env.WATCHMODE_BASE_URL ?? process.env.NEXT_PUBLIC_WATCHMODE_BASE_URL,
  WATCHMODE_API_KEY: process.env.WATCHMODE_API_KEY ?? process.env.NEXT_PUBLIC_WATCHMODE_API_KEY,
});
