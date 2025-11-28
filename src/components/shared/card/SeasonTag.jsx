import React from "react";
import { MediaTag } from "@/components/shared/card/MediaTag";

export const SeasonTag = ({ season, isCurrent = false, onClick }) => {
  return (
    <MediaTag
      title={season.title}
      subtitle={season.episodeCount ? `${season.episodeCount} حلقة` : null}
      isActive={isCurrent}
      onClick={onClick}
    />
  );
};
