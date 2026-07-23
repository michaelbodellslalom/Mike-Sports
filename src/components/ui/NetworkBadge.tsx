import { getNetworkInfo } from "@/lib/networkInfo";

export function NetworkBadge({ name }: { name: string }) {
  const info = getNetworkInfo(name);

  return (
    <span
      className="inline-flex shrink-0 items-center rounded px-2 py-0.5 text-xs font-bold tracking-wide"
      style={{ backgroundColor: info.bgColor, color: info.textColor }}
    >
      {name}
    </span>
  );
}
