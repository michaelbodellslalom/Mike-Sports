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

// All available teams and leagues for selection
export const allAvailableOptions = [
  // Minnesota Pro Teams
  "Minnesota Vikings",
  "Minnesota Twins",
  "Minnesota Wild",
  "Minnesota Timberwolves",
  "Minnesota Lynx",
  "Minnesota United",
  
  // University of Minnesota
  "University of Minnesota football",
  "University of Minnesota basketball",
  "University of Minnesota volleyball",
  
  // Popular Sports Leagues
  "NFL",
  "MLB",
  "NBA",
  "NHL",
  "MLS",
  "WNBA",
  "NCAAF",
  "NCAAB",
  "PGA",
  "UFC",
] as const;

export type FavoriteOption = (typeof initialFavoriteOptions)[number];
export type AvailableOption = (typeof allAvailableOptions)[number];
