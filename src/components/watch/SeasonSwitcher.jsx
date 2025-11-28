"use client";
import React from "react";
import { SeasonTag } from "@/components/shared/card/SeasonTag";
import { MediaSwitcher } from "./MediaSwitcher";

export default function SeasonSwitcher({
  seasons,
  currentSeasonId,
  onSeasonChange,
}) {
  const handleSeasonChange = (season) => {
    const seasonId = season.id || season._id;

    // Prevent action if already current
    if (seasonId === currentSeasonId) return;

    // Just call parent handler - instant switch, no loading
    onSeasonChange(seasonId);
  };

  return (
    <MediaSwitcher
      title="المواسم"
      items={seasons}
      renderItem={(season) => {
        const seasonId = season.id || season._id;
        const isCurrent = seasonId === currentSeasonId;

        return (
          <div
            className={
              isCurrent ? "ring-2 ring-cyan-400 rounded-lg relative" : ""
            }
          >
            <SeasonTag
              season={season}
              isCurrent={isCurrent}
              onClick={() => handleSeasonChange(season)}
            />
          </div>
        );
      }}
    />
  );
}
