import React from "react";
import { MediaTag } from "@/components/shared/card/MediaTag";

export const EpisodeTag = ({
  episode,
  watchPage = false,
  isCurrent = false,
  isLastEpisode = false,
}) => {
  return (
    <MediaTag
      title={episode.title}
      subtitle={episode.duration}
      isActive={isCurrent}
      isLastEpisode={isLastEpisode}
      href={watchPage ? `/${episode.slug}/watch` : `/${episode.slug}`}
    />
  );
};
