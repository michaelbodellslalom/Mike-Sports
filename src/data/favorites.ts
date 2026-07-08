export const initialFavoriteOptions = [
  "Minnesota Vikings",
  "Minnesota Twins",
  "Minnesota Wild",
  "Minnesota Timberwolves",
  "University of Minnesota football",
  "University of Minnesota basketball",
  "PGA",
  "UFC",
] as const;

export type FavoriteOption = (typeof initialFavoriteOptions)[number];
