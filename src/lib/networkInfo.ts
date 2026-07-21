export type NetworkInfo = {
  bgColor: string;
  textColor: string;
};

const networkInfoMap: Record<string, NetworkInfo> = {
  ESPN: { bgColor: "#CC0000", textColor: "#ffffff" },
  ESPN2: { bgColor: "#CC0000", textColor: "#ffffff" },
  "ESPN+": { bgColor: "#0a0a0a", textColor: "#ffffff" },
  "ESPN Deportes": { bgColor: "#CC0000", textColor: "#ffffff" },
  ABC: { bgColor: "#000000", textColor: "#ffffff" },
  NBC: { bgColor: "#f37021", textColor: "#ffffff" },
  "NBC Sports": { bgColor: "#f37021", textColor: "#ffffff" },
  Peacock: { bgColor: "#111827", textColor: "#ffffff" },
  Fox: { bgColor: "#1a1f71", textColor: "#ffffff" },
  "Fox Sports": { bgColor: "#1a1f71", textColor: "#ffffff" },
  FS1: { bgColor: "#1a1f71", textColor: "#ffffff" },
  FS2: { bgColor: "#1a1f71", textColor: "#ffffff" },
  CBS: { bgColor: "#1c1c2e", textColor: "#ffffff" },
  "CBS Sports": { bgColor: "#1c1c2e", textColor: "#ffffff" },
  TNT: { bgColor: "#ff6600", textColor: "#ffffff" },
  TBS: { bgColor: "#0099cc", textColor: "#ffffff" },
  truTV: { bgColor: "#8b0000", textColor: "#ffffff" },
  Max: { bgColor: "#002be7", textColor: "#ffffff" },
  HBO: { bgColor: "#002be7", textColor: "#ffffff" },
  "Amazon Prime": { bgColor: "#ff9900", textColor: "#000000" },
  "Prime Video": { bgColor: "#00a8e0", textColor: "#ffffff" },
  "Apple TV+": { bgColor: "#000000", textColor: "#ffffff" },
  Netflix: { bgColor: "#e50914", textColor: "#ffffff" },
  "Paramount+": { bgColor: "#0064ff", textColor: "#ffffff" },
  "NFL Network": { bgColor: "#013087", textColor: "#ffffff" },
  "MLB Network": { bgColor: "#002d72", textColor: "#ffffff" },
  "NBA TV": { bgColor: "#1d428a", textColor: "#ffffff" },
  "NHL Network": { bgColor: "#000000", textColor: "#ffffff" },
  "Golf Channel": { bgColor: "#006633", textColor: "#ffffff" },
  DAZN: { bgColor: "#f5ff00", textColor: "#000000" },
  "YouTube TV": { bgColor: "#ff0000", textColor: "#ffffff" },
  Hulu: { bgColor: "#1ce783", textColor: "#000000" },
  Fubo: { bgColor: "#e43028", textColor: "#ffffff" },
  DirecTV: { bgColor: "#00a8e0", textColor: "#ffffff" },
};

export function getNetworkInfo(name: string): NetworkInfo {
  const direct = networkInfoMap[name];
  if (direct) return direct;
  const lower = name.toLowerCase();
  for (const [key, info] of Object.entries(networkInfoMap)) {
    if (lower.includes(key.toLowerCase())) return info;
  }
  return { bgColor: "#64748b", textColor: "#ffffff" };
}
