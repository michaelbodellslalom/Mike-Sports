"use client";

import { TeamLogo } from "@/components/ui/TeamLogo";
import { allAvailableOptions } from "@/data/favorites";

type PreferencesSectionProps = {
  zipCode: string;
  geoMessage: string;
  favorites: readonly string[];
  onZipCodeChange: (value: string) => void;
  onUseGeolocation: () => void;
  onToggleFavorite: (favorite: string) => void;
  onMoveFavorite: (favorite: string, direction: "up" | "down") => void;
};

export function PreferencesSection({
  zipCode,
  geoMessage,
  favorites,
  onZipCodeChange,
  onUseGeolocation,
  onToggleFavorite,
  onMoveFavorite,
}: PreferencesSectionProps) {
  return (
    <section className="dashboard-section mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 sm:mt-6 sm:p-6" id="preferences-section" aria-labelledby="preferences-title">
      <h2 id="preferences-title" className="text-lg font-semibold">My Preferences</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">Customize your sports dashboard</p>

      <label className="mt-4 block text-sm font-medium" htmlFor="zipcode">ZIP code</label>
      <input
        id="zipcode"
        value={zipCode}
        onChange={(event) => onZipCodeChange(event.target.value)}
        className="mt-1 w-40 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
        inputMode="numeric"
        maxLength={5}
      />
      <p className="mt-1 text-xs text-[var(--muted)]">Default should be 80222.</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={onUseGeolocation} className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold">
          Use my location
        </button>
        <span role="status" aria-live="polite" className="text-xs text-[var(--muted)]">{geoMessage}</span>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold">Your Favorites ({favorites.length})</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">Ranked by importance. Drag or use arrows to reorder. These rankings impact your recommendations.</p>
        <div className="mt-3 space-y-1">
          {favorites.map((option, index) => (
            <div key={option} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--brand)] bg-emerald-50 px-3 py-2 text-left text-sm transition">
              <span className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700">#{index + 1}</span>
                <TeamLogo teamName={option} size={20} />
                <span className="flex-1">{option}</span>
              </span>
              <div className="flex gap-1">
                <button type="button" onClick={() => onMoveFavorite(option, "up")} disabled={index === 0} className="rounded px-2 py-1 text-xs font-bold text-emerald-700 transition hover:bg-emerald-200 disabled:opacity-25" aria-label="Move up">↑</button>
                <button type="button" onClick={() => onMoveFavorite(option, "down")} disabled={index === favorites.length - 1} className="rounded px-2 py-1 text-xs font-bold text-emerald-700 transition hover:bg-emerald-200 disabled:opacity-25" aria-label="Move down">↓</button>
                <button type="button" onClick={() => onToggleFavorite(option)} aria-pressed="true" className="rounded px-2 py-1 text-xs font-bold text-emerald-700 transition hover:bg-emerald-200">−</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold">Available to Add ({allAvailableOptions.length - favorites.length})</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">Click to add to your dashboard</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {allAvailableOptions.map((option) => {
            if (favorites.includes(option)) return null;
            return (
              <button key={option} type="button" onClick={() => onToggleFavorite(option)} aria-pressed="false" className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-left text-sm transition hover:border-[var(--brand)] hover:bg-emerald-50">
                <span className="flex items-center gap-2"><TeamLogo teamName={option} size={20} />{option}</span>
                <span className="text-lg font-bold text-gray-400">+</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
